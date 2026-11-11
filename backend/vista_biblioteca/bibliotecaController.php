<?php
    include_once '../config/DbConfig.php';

    class bibliotecaController{

        // Recursos por página cuando se ve un solo tema o se busca (1 tarjeta ancha + 4 filas de 2)
        const POR_PAGINA = 9;
        // Recursos que se muestran de cada tema en la vista "Todos" (1 tarjeta ancha + 2 normales)
        const POR_TEMA = 3;
        // Máximo de recomendaciones por emoción que se devuelven (la pantalla muestra 4 y el resto con "Ver todo")
        const MAXIMO_PARA_TI = 30;
        // Recursos que se muestran en la tarjeta lateral "Te puede interesar"
        const SUGERIDOS = 3;

        // Columnas de un recurso de la biblioteca (tabla bibliografia + el nombre de su foro)
        const COLUMNAS_RECURSO = "b.ID_BIBLIOGRAFIA, b.TITULO, b.DESCRIPCION, b.URL, b.AUTOR, b.TIPO,
                                  b.MODALIDAD_ACCESO, f.ID_FORO, f.TITULO AS FORO";

        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        // Solo se aceptan enlaces http/https: así un enlace guardado en la base no puede ejecutar código
        private function urlSegura($url) {
            $url = trim((string) $url);
            return preg_match('~^https?://~i', $url) === 1 ? $url : '';
        }

        private function conUrlSegura($filas) {
            foreach ($filas as &$fila) {
                $fila['URL'] = $this->urlSegura($fila['URL'] ?? '');
            }
            unset($fila);
            return $filas;
        }

        // "Recomendadas para ti": recursos de la emoción más reciente de la persona.
        // Las frases (TIPO = 'FRASE') no se incluyen: son para la pantalla de Retroalimentación.
        public function obtenerParaTi($id_usuario) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                // Emoción más reciente (si hay empate de fecha, la última registrada)
                $stmt = $conectar->prepare(
                    "SELECT tp.ID_EMOCION, tp.NOMBRE
                     FROM estado_emocional em
                     INNER JOIN tipo_emocion tp ON tp.ID_EMOCION = em.ID_EMOCION
                     WHERE em.ID_USUARIO = :id_usuario
                     ORDER BY em.FECHA_REG DESC, em.ID_ESTADO_EMOCIONAL DESC
                     LIMIT 1"
                );
                $stmt->bindValue(':id_usuario', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->execute();
                $emocion = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$emocion) {
                    return ['emocion' => null, 'recursos' => []];
                }

                $stmt = $conectar->prepare(
                    "SELECT ID_RECOMENDACION, TITULO, TIPO, DESCRIPCION, URL
                     FROM recomendaciones
                     WHERE ID_TIPO_EMOCION = :emocion AND TIPO <> 'FRASE'
                     ORDER BY ID_RECOMENDACION DESC
                     LIMIT :limite"
                );
                $stmt->bindValue(':emocion', (int) $emocion['ID_EMOCION'], PDO::PARAM_INT);
                $stmt->bindValue(':limite', self::MAXIMO_PARA_TI, PDO::PARAM_INT);
                $stmt->execute();

                return [
                    'emocion' => $emocion,
                    'recursos' => $this->conUrlSegura($stmt->fetchAll(PDO::FETCH_ASSOC))
                ];
            } catch (Exception $e) {
                throw new Exception("Error al obtener las recomendaciones: " . $e->getMessage());
            }
        }

        // Temas (foros) que tienen al menos un recurso: son los filtros de la biblioteca
        public function obtenerTemas() {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare(
                    "SELECT f.ID_FORO, f.TITULO, COUNT(b.ID_BIBLIOGRAFIA) AS RECURSOS
                     FROM foro f
                     INNER JOIN bibliografia b ON b.ID_FORO = f.ID_FORO
                     GROUP BY f.ID_FORO, f.TITULO
                     ORDER BY f.ID_FORO"
                );
                $stmt->execute();
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (Exception $e) {
                throw new Exception("Error al obtener los temas: " . $e->getMessage());
            }
        }

        // Vista "Todos": un bloque por foro (solo los que tienen recursos), con su total
        // y los recursos más recientes de cada uno.
        public function obtenerPorTemas() {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare(
                    "SELECT f.ID_FORO, f.TITULO, COUNT(b.ID_BIBLIOGRAFIA) AS TOTAL
                     FROM foro f
                     INNER JOIN bibliografia b ON b.ID_FORO = f.ID_FORO
                     GROUP BY f.ID_FORO, f.TITULO
                     ORDER BY f.ID_FORO"
                );
                $stmt->execute();
                $temas = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Una sola consulta preparada, usada una vez por cada foro (son pocos)
                $stmt = $conectar->prepare(
                    "SELECT " . self::COLUMNAS_RECURSO . "
                     FROM bibliografia b
                     INNER JOIN foro f ON f.ID_FORO = b.ID_FORO
                     WHERE b.ID_FORO = :id_foro
                     ORDER BY b.ID_BIBLIOGRAFIA DESC
                     LIMIT :limite"
                );
                foreach ($temas as &$tema) {
                    $stmt->bindValue(':id_foro', (int) $tema['ID_FORO'], PDO::PARAM_INT);
                    $stmt->bindValue(':limite', self::POR_TEMA, PDO::PARAM_INT);
                    $stmt->execute();
                    $tema['TOTAL'] = (int) $tema['TOTAL'];
                    $tema['recursos'] = $this->conUrlSegura($stmt->fetchAll(PDO::FETCH_ASSOC));
                }
                unset($tema);

                return $temas;
            } catch (Exception $e) {
                throw new Exception("Error al obtener la biblioteca por temas: " . $e->getMessage());
            }
        }

        // Lista de recursos de bibliografia, con filtro por tema y búsqueda (un tema elegido, o resultados de búsqueda)
        public function listarRecursos($id_foro, $busqueda, $pagina) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $limite = self::POR_PAGINA;
                $offset = max(0, ((int) $pagina) - 1) * $limite;

                $sql = "SELECT " . self::COLUMNAS_RECURSO . "
                        FROM bibliografia b
                        INNER JOIN foro f ON f.ID_FORO = b.ID_FORO
                        WHERE 1 = 1";
                $params = [];

                if (!empty($id_foro)) {
                    $sql .= " AND b.ID_FORO = :id_foro";
                    $params[':id_foro'] = (int) $id_foro;
                }
                if ($busqueda !== '') {
                    $sql .= " AND (b.TITULO LIKE :q1 OR b.DESCRIPCION LIKE :q2)";
                    $like = '%' . addcslashes($busqueda, '%_\\') . '%';
                    $params[':q1'] = $like;
                    $params[':q2'] = $like;
                }

                $sql .= " ORDER BY b.ID_BIBLIOGRAFIA DESC LIMIT :limite OFFSET :offset";

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
                return ['recursos' => $this->conUrlSegura($filas), 'hay_mas' => $hayMas];
            } catch (Exception $e) {
                throw new Exception("Error al listar los recursos: " . $e->getMessage());
            }
        }

        // Tarjeta lateral "Te puede interesar": recursos al azar
        public function obtenerSugeridos() {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare(
                    "SELECT ID_BIBLIOGRAFIA, TITULO, DESCRIPCION, URL, TIPO
                     FROM bibliografia
                     ORDER BY RAND()
                     LIMIT :limite"
                );
                $stmt->bindValue(':limite', self::SUGERIDOS, PDO::PARAM_INT);
                $stmt->execute();
                return $this->conUrlSegura($stmt->fetchAll(PDO::FETCH_ASSOC));
            } catch (Exception $e) {
                throw new Exception("Error al obtener las sugerencias: " . $e->getMessage());
            }
        }
    }
?>
