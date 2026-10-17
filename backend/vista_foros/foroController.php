<?php
    include_once '../config/DbConfig.php';

    class foroController{

        // Hilos que se devuelven por página ("Ver más hilos" pide la siguiente)
        const POR_PAGINA = 10;

        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        // Nombre público de quien escribe: "Elena R." (nunca se expone email ni contraseña)
        private function sqlAutor($alias) {
            return "CONCAT(SUBSTRING_INDEX($alias.NOMBRES, ' ', 1),
                           IF($alias.APELLIDOS = '', '', CONCAT(' ', UPPER(LEFT($alias.APELLIDOS, 1)), '.'))) AS AUTOR,
                    UPPER(LEFT($alias.NOMBRES, 1)) AS INICIAL";
        }

        private function existeUsuario($conectar, $id_usuario) {
            $stmt = $conectar->prepare("SELECT 1 FROM usuario WHERE ID_USUARIO = :id");
            $stmt->bindValue(':id', (int) $id_usuario, PDO::PARAM_INT);
            $stmt->execute();
            return (bool) $stmt->fetchColumn();
        }

        // Los 6 foros con la cantidad de hilos visibles de cada uno
        public function obtenerForos() {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare(
                    "SELECT f.ID_FORO, f.TITULO, f.DESCRIPCION, f.ICONO,
                            (SELECT COUNT(*) FROM participacion p
                             WHERE p.ID_FORO = f.ID_FORO AND p.MOSTRAR = 1) AS HILOS
                     FROM foro f
                     ORDER BY f.ID_FORO"
                );
                $stmt->execute();
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (Exception $e) {
                throw new Exception("Error al obtener los foros: " . $e->getMessage());
            }
        }

        // Lista de hilos visibles (MOSTRAR = 1), con filtros opcionales
        // $filtro: 'recientes' | 'sin-respuesta'
        public function obtenerHilos($id_foro, $filtro, $busqueda, $pagina) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $limite = self::POR_PAGINA;
                $offset = max(0, ((int) $pagina) - 1) * $limite;

                $sql = "SELECT p.ID_PARTICIPACION, p.TITULO, LEFT(p.CONTENIDO, 300) AS RESUMEN,
                               p.FECHA_PUBLICACION, f.ID_FORO, f.TITULO AS FORO,
                               " . $this->sqlAutor('u') . ",
                               (SELECT COUNT(*) FROM respuesta r
                                WHERE r.ID_PARTICIPACION = p.ID_PARTICIPACION AND r.MOSTRAR = 1) AS RESPUESTAS
                        FROM participacion p
                        INNER JOIN foro f ON f.ID_FORO = p.ID_FORO
                        INNER JOIN usuario u ON u.ID_USUARIO = p.ID_CLIENTE
                        WHERE p.MOSTRAR = 1";
                $params = [];

                if (!empty($id_foro)) {
                    $sql .= " AND p.ID_FORO = :id_foro";
                    $params[':id_foro'] = (int) $id_foro;
                }
                if ($busqueda !== '') {
                    $sql .= " AND (p.TITULO LIKE :q1 OR p.CONTENIDO LIKE :q2)";
                    $like = '%' . addcslashes($busqueda, '%_\\') . '%';
                    $params[':q1'] = $like;
                    $params[':q2'] = $like;
                }
                if ($filtro === 'sin-respuesta') {
                    $sql .= " AND NOT EXISTS (SELECT 1 FROM respuesta r2
                                              WHERE r2.ID_PARTICIPACION = p.ID_PARTICIPACION AND r2.MOSTRAR = 1)";
                }

                $sql .= " ORDER BY p.FECHA_PUBLICACION DESC, p.ID_PARTICIPACION DESC
                          LIMIT :limite OFFSET :offset";

                $stmt = $conectar->prepare($sql);
                foreach ($params as $clave => $valor) {
                    $stmt->bindValue($clave, $valor, is_int($valor) ? PDO::PARAM_INT : PDO::PARAM_STR);
                }
                // Se pide uno de más para saber si existe una página siguiente
                $stmt->bindValue(':limite', $limite + 1, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
                $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $hayMas = count($filas) > $limite;
                if ($hayMas) {
                    array_pop($filas);
                }
                return ['hilos' => $filas, 'hay_mas' => $hayMas];
            } catch (Exception $e) {
                throw new Exception("Error al obtener los hilos: " . $e->getMessage());
            }
        }

        // Un hilo completo con sus respuestas visibles
        public function obtenerHilo($id_hilo) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare(
                    "SELECT p.ID_PARTICIPACION, p.TITULO, p.CONTENIDO, p.FECHA_PUBLICACION,
                            f.ID_FORO, f.TITULO AS FORO,
                            " . $this->sqlAutor('u') . "
                     FROM participacion p
                     INNER JOIN foro f ON f.ID_FORO = p.ID_FORO
                     INNER JOIN usuario u ON u.ID_USUARIO = p.ID_CLIENTE
                     WHERE p.ID_PARTICIPACION = :id AND p.MOSTRAR = 1"
                );
                $stmt->bindValue(':id', (int) $id_hilo, PDO::PARAM_INT);
                $stmt->execute();
                $hilo = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$hilo) {
                    return [];
                }

                $stmt = $conectar->prepare(
                    "SELECT r.ID_RESPUESTA, r.CONTENIDO, r.FECHA_PUBLICACION,
                            " . $this->sqlAutor('u') . "
                     FROM respuesta r
                     INNER JOIN usuario u ON u.ID_USUARIO = r.ID_CLIENTE
                     WHERE r.ID_PARTICIPACION = :id AND r.MOSTRAR = 1
                     ORDER BY r.FECHA_PUBLICACION ASC, r.ID_RESPUESTA ASC"
                );
                $stmt->bindValue(':id', (int) $id_hilo, PDO::PARAM_INT);
                $stmt->execute();
                $hilo['LISTA_RESPUESTAS'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Se devuelve dentro de un arreglo para mantener el mismo formato que las demás consultas
                return [$hilo];
            } catch (Exception $e) {
                throw new Exception("Error al obtener el hilo: " . $e->getMessage());
            }
        }

        // Publica un hilo nuevo. Queda PENDIENTE (MOSTRAR = 0) hasta que un moderador lo apruebe.
        // El moderador del hilo es el moderador del foro.
        public function crearHilo($id_foro, $titulo, $contenido, $id_usuario) {
            $titulo = trim((string) $titulo);
            $contenido = trim((string) $contenido);

            if (mb_strlen($titulo, 'UTF-8') < 5 || mb_strlen($titulo, 'UTF-8') > 120) {
                throw new InvalidArgumentException("El título debe tener entre 5 y 120 caracteres");
            }
            if (mb_strlen($contenido, 'UTF-8') < 10 || mb_strlen($contenido, 'UTF-8') > 5000) {
                throw new InvalidArgumentException("El mensaje debe tener entre 10 y 5000 caracteres");
            }

            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                if (!$this->existeUsuario($conectar, $id_usuario)) {
                    throw new InvalidArgumentException("Usuario no válido");
                }

                $fecha = date('Y-m-d H:i:s');

                $stmt = $conectar->prepare(
                    "INSERT INTO participacion
                        (TITULO, CONTENIDO, FECHA_PUBLICACION, MOSTRAR, OBS_MODERADOR, FECHA_REG_OBS,
                         ID_FORO, ID_CLIENTE, ID_MODERADOR)
                     SELECT :titulo, :contenido, :fecha, 0, NULL, NULL,
                            f.ID_FORO, :id_usuario, f.ID_MODERADOR
                     FROM foro f
                     WHERE f.ID_FORO = :id_foro"
                );
                $stmt->bindValue(':titulo', $titulo);
                $stmt->bindValue(':contenido', $contenido);
                $stmt->bindValue(':fecha', $fecha);
                $stmt->bindValue(':id_usuario', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->bindValue(':id_foro', (int) $id_foro, PDO::PARAM_INT);
                $stmt->execute();

                // Si el foro no existe, el SELECT no devuelve filas y no se inserta nada
                if ($stmt->rowCount() === 0) {
                    throw new InvalidArgumentException("El foro seleccionado no existe");
                }
                return true;
            } catch (InvalidArgumentException $e) {
                throw $e;
            } catch (Exception $e) {
                throw new Exception("Error al guardar la publicación: " . $e->getMessage());
            }
        }

        // Publica una respuesta. Es visible de inmediato; el moderador puede ocultarla después.
        public function crearRespuesta($id_hilo, $contenido, $id_usuario) {
            $contenido = trim((string) $contenido);

            if (mb_strlen($contenido, 'UTF-8') < 2 || mb_strlen($contenido, 'UTF-8') > 2000) {
                throw new InvalidArgumentException("La respuesta debe tener entre 2 y 2000 caracteres");
            }

            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                if (!$this->existeUsuario($conectar, $id_usuario)) {
                    throw new InvalidArgumentException("Usuario no válido");
                }

                // Solo se puede responder a hilos ya aprobados
                $stmt = $conectar->prepare(
                    "SELECT 1 FROM participacion WHERE ID_PARTICIPACION = :id AND MOSTRAR = 1"
                );
                $stmt->bindValue(':id', (int) $id_hilo, PDO::PARAM_INT);
                $stmt->execute();
                if (!$stmt->fetchColumn()) {
                    throw new InvalidArgumentException("El hilo no existe o aún no está disponible");
                }

                $fecha = date('Y-m-d H:i:s');

                $stmt = $conectar->prepare(
                    "INSERT INTO respuesta
                        (CONTENIDO, FECHA_PUBLICACION, MOSTRAR, ID_PARTICIPACION, ID_CLIENTE)
                     VALUES
                        (:contenido, :fecha, 1, :id_hilo, :id_usuario)"
                );
                $stmt->bindValue(':contenido', $contenido);
                $stmt->bindValue(':fecha', $fecha);
                $stmt->bindValue(':id_hilo', (int) $id_hilo, PDO::PARAM_INT);
                $stmt->bindValue(':id_usuario', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->execute();

                return true;
            } catch (InvalidArgumentException $e) {
                throw $e;
            } catch (Exception $e) {
                throw new Exception("Error al guardar la respuesta: " . $e->getMessage());
            }
        }
    }
?>
