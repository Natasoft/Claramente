<?php
    include_once '../config/DbConfig.php';

    // Se lanza cuando la persona no tiene permiso sobre el foro o la publicación
    class AccesoDenegadoException extends Exception {}

    class moderacionController{

        // Valores de la tabla roles (1 ADMINISTRADOR, 2 MODERADOR, 3 CLIENTE)
        const ROL_ADMINISTRADOR = 1;
        const ROL_MODERADOR = 2;

        // Máximo de publicaciones que devuelve cada listado
        const MAXIMO_LISTA = 50;

        // Estado de una publicación, calculado con las columnas que ya existen:
        //  aprobada  = MOSTRAR 1
        //  pendiente = MOSTRAR 0 y sin fecha de revisión
        //  rechazada = MOSTRAR 0 con fecha de revisión
        const SQL_ESTADO = "CASE WHEN p.MOSTRAR = 1 THEN 'aprobada'
                                 WHEN p.FECHA_REG_OBS IS NULL THEN 'pendiente'
                                 ELSE 'rechazada' END";

        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        // ------------------------------------------------------------------
        // Utilidades internas
        // ------------------------------------------------------------------

        // Nombre público de quien escribe: "Elena R." (nunca se expone email ni contraseña)
        private function sqlAutor($alias) {
            return "CONCAT(SUBSTRING_INDEX($alias.NOMBRES, ' ', 1),
                           IF($alias.APELLIDOS = '', '', CONCAT(' ', UPPER(LEFT($alias.APELLIDOS, 1)), '.'))) AS AUTOR,
                    UPPER(LEFT($alias.NOMBRES, 1)) AS INICIAL";
        }

        private function marcadores($prefijo, $cantidad) {
            $lista = [];
            for ($i = 0; $i < $cantidad; $i++) {
                $lista[] = ':' . $prefijo . $i;
            }
            return implode(',', $lista);
        }

        private function condicionEstado($estado) {
            if ($estado === 'aprobadas') {
                return "p.MOSTRAR = 1";
            }
            if ($estado === 'rechazadas') {
                return "(p.MOSTRAR = 0 AND p.FECHA_REG_OBS IS NOT NULL)";
            }
            return "(p.MOSTRAR = 0 AND p.FECHA_REG_OBS IS NULL)"; // pendientes
        }

        // Foros sobre los que se puede consultar: todos los que la persona puede moderar,
        // o solo $id_foro si es uno de ellos. Si no tiene ninguno, se deniega el acceso.
        private function forosAConsultar($id_usuario, $id_foro) {
            $permisos = $this->obtenerPermisos($id_usuario);
            $ids = array_map('intval', array_column($permisos['foros'], 'ID_FORO'));

            if (count($ids) === 0) {
                throw new AccesoDenegadoException("No tienes permisos de moderación");
            }
            if (!empty($id_foro)) {
                if (!in_array((int) $id_foro, $ids, true)) {
                    throw new AccesoDenegadoException("No moderas ese foro");
                }
                return [(int) $id_foro];
            }
            return $ids;
        }

        // ------------------------------------------------------------------
        // Permisos
        // ------------------------------------------------------------------

        // Permisos de moderación de un usuario:
        //  - ADMINISTRADOR: puede moderar todos los foros.
        //  - MODERADOR: solo los foros donde figura como foro.ID_MODERADOR.
        //  - Cualquier otro rol (CLIENTE): ninguno.
        // El rol se lee siempre de la base de datos, nunca de lo que envíe el navegador.
        public function obtenerPermisos($id_usuario) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare("SELECT ID_ROL FROM usuario WHERE ID_USUARIO = :id_usuario");
                $stmt->bindValue(':id_usuario', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->execute();
                $rol = (int) $stmt->fetchColumn(); // 0 si el usuario no existe

                $foros = [];
                if ($rol === self::ROL_ADMINISTRADOR) {
                    $stmt = $conectar->prepare("SELECT ID_FORO, TITULO FROM foro ORDER BY ID_FORO");
                    $stmt->execute();
                    $foros = $stmt->fetchAll(PDO::FETCH_ASSOC);
                } else if ($rol === self::ROL_MODERADOR) {
                    $stmt = $conectar->prepare(
                        "SELECT ID_FORO, TITULO FROM foro WHERE ID_MODERADOR = :id_usuario ORDER BY ID_FORO"
                    );
                    $stmt->bindValue(':id_usuario', (int) $id_usuario, PDO::PARAM_INT);
                    $stmt->execute();
                    $foros = $stmt->fetchAll(PDO::FETCH_ASSOC);
                }

                return [
                    'es_administrador' => $rol === self::ROL_ADMINISTRADOR,
                    'es_moderador' => count($foros) > 0, // puede entrar al panel
                    'foros' => $foros
                ];
            } catch (Exception $e) {
                throw new Exception("Error al consultar los permisos: " . $e->getMessage());
            }
        }

        // ------------------------------------------------------------------
        // Métricas: pendientes, aprobadas y rechazadas
        // ------------------------------------------------------------------
        public function obtenerResumen($id_usuario, $id_foro) {
            $ids = $this->forosAConsultar($id_usuario, $id_foro);

            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare(
                    "SELECT SUM(p.MOSTRAR = 0 AND p.FECHA_REG_OBS IS NULL) AS PENDIENTES,
                            SUM(p.MOSTRAR = 1) AS APROBADAS,
                            SUM(p.MOSTRAR = 0 AND p.FECHA_REG_OBS IS NOT NULL) AS RECHAZADAS
                     FROM participacion p
                     WHERE p.ID_FORO IN (" . $this->marcadores('f', count($ids)) . ")"
                );
                foreach ($ids as $i => $id) {
                    $stmt->bindValue(':f' . $i, $id, PDO::PARAM_INT);
                }
                $stmt->execute();
                $fila = $stmt->fetch(PDO::FETCH_ASSOC);

                // Se devuelve dentro de un arreglo para mantener el mismo formato que las demás consultas
                return [[
                    'PENDIENTES' => (int) ($fila['PENDIENTES'] ?? 0),
                    'APROBADAS' => (int) ($fila['APROBADAS'] ?? 0),
                    'RECHAZADAS' => (int) ($fila['RECHAZADAS'] ?? 0)
                ]];
            } catch (Exception $e) {
                throw new Exception("Error al calcular el resumen: " . $e->getMessage());
            }
        }

        // ------------------------------------------------------------------
        // Listado de publicaciones por estado
        // Pendientes: las más antiguas primero. Aprobadas y rechazadas: las más recientes primero.
        // ------------------------------------------------------------------
        public function listarPublicaciones($id_usuario, $id_foro, $estado) {
            $ids = $this->forosAConsultar($id_usuario, $id_foro);

            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $orden = ($estado === 'pendientes') ? 'ASC' : 'DESC';

                $stmt = $conectar->prepare(
                    "SELECT p.ID_PARTICIPACION, p.TITULO, LEFT(p.CONTENIDO, 200) AS RESUMEN,
                            p.FECHA_PUBLICACION, p.FECHA_REG_OBS,
                            f.ID_FORO, f.TITULO AS FORO,
                            " . $this->sqlAutor('u') . ",
                            " . self::SQL_ESTADO . " AS ESTADO
                     FROM participacion p
                     INNER JOIN foro f ON f.ID_FORO = p.ID_FORO
                     INNER JOIN usuario u ON u.ID_USUARIO = p.ID_CLIENTE
                     WHERE p.ID_FORO IN (" . $this->marcadores('f', count($ids)) . ")
                       AND " . $this->condicionEstado($estado) . "
                     ORDER BY p.FECHA_PUBLICACION $orden, p.ID_PARTICIPACION $orden
                     LIMIT :limite"
                );
                foreach ($ids as $i => $id) {
                    $stmt->bindValue(':f' . $i, $id, PDO::PARAM_INT);
                }
                // Se pide una de más para saber si hay más de las que se muestran
                $stmt->bindValue(':limite', self::MAXIMO_LISTA + 1, PDO::PARAM_INT);
                $stmt->execute();
                $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $hayMas = count($filas) > self::MAXIMO_LISTA;
                if ($hayMas) {
                    array_pop($filas);
                }
                return ['publicaciones' => $filas, 'hay_mas' => $hayMas];
            } catch (Exception $e) {
                throw new Exception("Error al listar las publicaciones: " . $e->getMessage());
            }
        }

        // ------------------------------------------------------------------
        // Una publicación completa, con la observación del moderador (solo la ve quien modera)
        // ------------------------------------------------------------------
        public function obtenerPublicacion($id_usuario, $id_participacion) {
            $permitidos = $this->forosAConsultar($id_usuario, null);

            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare(
                    "SELECT p.ID_PARTICIPACION, p.TITULO, p.CONTENIDO, p.FECHA_PUBLICACION,
                            p.OBS_MODERADOR, p.FECHA_REG_OBS,
                            f.ID_FORO, f.TITULO AS FORO,
                            " . $this->sqlAutor('u') . ",
                            " . self::SQL_ESTADO . " AS ESTADO
                     FROM participacion p
                     INNER JOIN foro f ON f.ID_FORO = p.ID_FORO
                     INNER JOIN usuario u ON u.ID_USUARIO = p.ID_CLIENTE
                     WHERE p.ID_PARTICIPACION = :id"
                );
                $stmt->bindValue(':id', (int) $id_participacion, PDO::PARAM_INT);
                $stmt->execute();
                $fila = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$fila) {
                    return [];
                }
                if (!in_array((int) $fila['ID_FORO'], $permitidos, true)) {
                    throw new AccesoDenegadoException("No moderas el foro de esta publicación");
                }
                return [$fila];
            } catch (AccesoDenegadoException $e) {
                throw $e;
            } catch (Exception $e) {
                throw new Exception("Error al obtener la publicación: " . $e->getMessage());
            }
        }

        // ------------------------------------------------------------------
        // Aprobar o rechazar una publicación
        //  - aprobar:  MOSTRAR = 1 (observación opcional)
        //  - rechazar: MOSTRAR = 0 (observación obligatoria: el motivo)
        // Se registra quién la revisó (ID_MODERADOR) y cuándo (FECHA_REG_OBS).
        // También sirve para ocultar una publicación ya aprobada, o aprobar una rechazada.
        // ------------------------------------------------------------------
        public function revisar($id_usuario, $id_participacion, $decision, $observacion) {
            if ($decision !== 'aprobar' && $decision !== 'rechazar') {
                throw new InvalidArgumentException("Decisión no válida");
            }
            $observacion = trim((string) $observacion);
            $largo = mb_strlen($observacion, 'UTF-8');
            if ($largo > 1000) {
                throw new InvalidArgumentException("La observación no puede superar los 1000 caracteres");
            }
            if ($decision === 'rechazar' && $largo < 5) {
                throw new InvalidArgumentException("Escribe el motivo del rechazo (mínimo 5 caracteres)");
            }

            $permitidos = $this->forosAConsultar($id_usuario, null);

            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                // El foro de la publicación debe ser uno de los que esta persona puede moderar
                $stmt = $conectar->prepare("SELECT ID_FORO FROM participacion WHERE ID_PARTICIPACION = :id");
                $stmt->bindValue(':id', (int) $id_participacion, PDO::PARAM_INT);
                $stmt->execute();
                $id_foro = $stmt->fetchColumn();

                if ($id_foro === false) {
                    throw new InvalidArgumentException("La publicación no existe");
                }
                if (!in_array((int) $id_foro, $permitidos, true)) {
                    throw new AccesoDenegadoException("No moderas el foro de esta publicación");
                }

                $stmt = $conectar->prepare(
                    "UPDATE participacion
                     SET MOSTRAR = :mostrar, OBS_MODERADOR = :obs,
                         FECHA_REG_OBS = :fecha, ID_MODERADOR = :moderador
                     WHERE ID_PARTICIPACION = :id"
                );
                $stmt->bindValue(':mostrar', $decision === 'aprobar' ? 1 : 0, PDO::PARAM_INT);
                $stmt->bindValue(':obs', $observacion);
                $stmt->bindValue(':fecha', date('Y-m-d H:i:s'));
                $stmt->bindValue(':moderador', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->bindValue(':id', (int) $id_participacion, PDO::PARAM_INT);
                $stmt->execute();

                return true;
            } catch (InvalidArgumentException | AccesoDenegadoException $e) {
                throw $e;
            } catch (Exception $e) {
                throw new Exception("Error al guardar la decisión: " . $e->getMessage());
            }
        }
    }
?>
