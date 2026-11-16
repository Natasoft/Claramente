<?php
    include_once '../config/DbConfig.php';

    class perfilController{

        // Mismas reglas que el registro (registroController.php)
        const REGEX_NOMBRE = '/^[\p{L}\p{M}][\p{L}\p{M} .\'-]*$/u';

        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        private function nombreValido($texto) {
            $largo = mb_strlen($texto, 'UTF-8');
            return $largo >= 2 && $largo <= 30 && preg_match(self::REGEX_NOMBRE, $texto) === 1;
        }

        // Los datos que la cuenta ya tiene (nombres, apellidos, correo y rol) y las estadísticas
        // de la propia persona. Nunca se devuelve la contraseña.
        public function obtenerPerfil($id_usuario) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare(
                    "SELECT u.NOMBRES, u.APELLIDOS, u.EMAIL, r.DESCRIPCION AS ROL
                     FROM usuario u
                     INNER JOIN roles r ON r.ID_ROL = u.ID_ROL
                     WHERE u.ID_USUARIO = :id"
                );
                $stmt->bindValue(':id', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->execute();
                $perfil = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$perfil) {
                    return [];
                }

                // Estadísticas: total de registros, el primero, y días distintos con registro en los últimos 30
                $stmt = $conectar->prepare(
                    "SELECT COUNT(*) AS TOTAL, MIN(FECHA_REG) AS PRIMERO,
                            COUNT(DISTINCT CASE WHEN FECHA_REG >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                                                THEN DATE(FECHA_REG) END) AS DIAS_30
                     FROM estado_emocional
                     WHERE ID_USUARIO = :id"
                );
                $stmt->bindValue(':id', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->execute();
                $est = $stmt->fetch(PDO::FETCH_ASSOC);

                $perfil['TOTAL_REGISTROS'] = (int) ($est['TOTAL'] ?? 0);
                $perfil['PRIMER_REGISTRO'] = $est['PRIMERO'] ?? null;
                $perfil['DIAS_30'] = (int) ($est['DIAS_30'] ?? 0);

                // Se devuelve dentro de un arreglo para mantener el mismo formato que las demás consultas
                return [$perfil];
            } catch (Exception $e) {
                throw new Exception("Error al obtener el perfil: " . $e->getMessage());
            }
        }

        // Cambia los nombres y apellidos de la propia persona.
        // El correo y la contraseña NO se cambian aquí. No se guarda ningún dato nuevo.
        public function actualizarPerfil($id_usuario, $nombres, $apellidos) {
            $nombres = preg_replace('/ {2,}/', ' ', trim((string) $nombres));
            $apellidos = preg_replace('/ {2,}/', ' ', trim((string) $apellidos));

            if (!$this->nombreValido($nombres)) {
                throw new InvalidArgumentException("Los nombres no son válidos");
            }
            if (!$this->nombreValido($apellidos)) {
                throw new InvalidArgumentException("Los apellidos no son válidos");
            }

            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare(
                    "UPDATE usuario SET NOMBRES = :nombres, APELLIDOS = :apellidos WHERE ID_USUARIO = :id"
                );
                $stmt->bindValue(':nombres', $nombres);
                $stmt->bindValue(':apellidos', $apellidos);
                $stmt->bindValue(':id', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->execute();

                return ['NOMBRES' => $nombres, 'APELLIDOS' => $apellidos];
            } catch (Exception $e) {
                throw new Exception("Error al guardar el perfil: " . $e->getMessage());
            }
        }
    }
?>
