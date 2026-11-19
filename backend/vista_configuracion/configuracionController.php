<?php
    include_once '../config/DbConfig.php';
    include_once '../config/PasswordManager.php';

    // La contraseña actual que escribió la persona no coincide con la guardada
    class ClaveIncorrectaException extends Exception {}

    class configuracionController{

        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        // Cambia la contraseña de la propia persona.
        // Exige la actual, valida la nueva (8 a 72 caracteres, distinta) y la guarda con hash robusto.
        public function cambiarClave($id_usuario, $actual, $nueva) {
            $actual = (string) $actual;
            $nueva = (string) $nueva;

            if ($actual === '') {
                throw new InvalidArgumentException("Escribe tu contraseña actual");
            }
            $error = PasswordManager::validarNueva($nueva);
            if ($error !== null) {
                throw new InvalidArgumentException($error);
            }
            if ($actual === $nueva) {
                throw new InvalidArgumentException("La nueva contraseña debe ser distinta de la actual");
            }

            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare("SELECT PASSWORD FROM usuario WHERE ID_USUARIO = :id");
                $stmt->bindValue(':id', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->execute();
                $guardada = $stmt->fetchColumn();

                if ($guardada === false) {
                    throw new InvalidArgumentException("La cuenta no existe");
                }

                // Sirve para el hash nuevo y también para cuentas que aún tengan el MD5 antiguo
                $resultado = PasswordManager::verificar($actual, $guardada);
                if (!$resultado['correcta']) {
                    throw new ClaveIncorrectaException("La contraseña actual no es correcta");
                }

                $hash = PasswordManager::hashear($nueva);
                // Si PASSWORD aún mide 50, el hash se guardaría cortado y la cuenta quedaría inservible
                if (!PasswordManager::cabeEnColumna($conectar, $hash)) {
                    throw new Exception("La columna usuario.PASSWORD es muy corta: ejecuta el ALTER TABLE del script de contraseñas");
                }

                // "AND PASSWORD = :anterior" evita pisar un cambio hecho al mismo tiempo desde otra sesión
                $stmt = $conectar->prepare(
                    "UPDATE usuario SET PASSWORD = :hash WHERE ID_USUARIO = :id AND PASSWORD = :anterior"
                );
                $stmt->bindValue(':hash', $hash);
                $stmt->bindValue(':id', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->bindValue(':anterior', $guardada);
                $stmt->execute();

                if ($stmt->rowCount() === 0) {
                    throw new Exception("La contraseña cambió mientras tanto. Intenta de nuevo");
                }
                return true;
            } catch (InvalidArgumentException | ClaveIncorrectaException $e) {
                throw $e;
            } catch (Exception $e) {
                throw new Exception("Error al cambiar la contraseña: " . $e->getMessage());
            }
        }

        // ¿Ya registró una emoción hoy? (para el recordatorio diario).
        // "Hoy" se calcula en PHP, con la misma hora con la que se guardan los registros.
        public function registroHoy($id_usuario) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare(
                    "SELECT COUNT(*) FROM estado_emocional WHERE ID_USUARIO = :id AND FECHA_REG >= :inicio"
                );
                $stmt->bindValue(':id', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->bindValue(':inicio', date('Y-m-d') . ' 00:00:00');
                $stmt->execute();

                return ((int) $stmt->fetchColumn()) > 0;
            } catch (Exception $e) {
                throw new Exception("Error al consultar el registro de hoy: " . $e->getMessage());
            }
        }

        // Copia de los datos de la propia persona: cuenta, registros emocionales, publicaciones y respuestas.
        // NO incluye la contraseña ni las observaciones internas de moderación.
        public function exportarDatos($id_usuario) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();
                $id = (int) $id_usuario;

                $stmt = $conectar->prepare(
                    "SELECT u.NOMBRES, u.APELLIDOS, u.EMAIL, r.DESCRIPCION AS ROL
                     FROM usuario u INNER JOIN roles r ON r.ID_ROL = u.ID_ROL
                     WHERE u.ID_USUARIO = :id"
                );
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
                $stmt->execute();
                $cuenta = $stmt->fetch(PDO::FETCH_ASSOC);

                $stmt = $conectar->prepare(
                    "SELECT em.FECHA_REG AS FECHA, tp.NOMBRE AS EMOCION, em.INTENSIDAD, em.COMENTARIO
                     FROM estado_emocional em
                     INNER JOIN tipo_emocion tp ON tp.ID_EMOCION = em.ID_EMOCION
                     WHERE em.ID_USUARIO = :id
                     ORDER BY em.FECHA_REG DESC, em.ID_ESTADO_EMOCIONAL DESC"
                );
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
                $stmt->execute();
                $emociones = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $stmt = $conectar->prepare(
                    "SELECT p.TITULO, p.CONTENIDO, p.FECHA_PUBLICACION AS FECHA, f.TITULO AS FORO,
                            CASE WHEN p.MOSTRAR = 1 THEN 'aprobada'
                                 WHEN p.FECHA_REG_OBS IS NULL THEN 'pendiente'
                                 ELSE 'rechazada' END AS ESTADO
                     FROM participacion p
                     INNER JOIN foro f ON f.ID_FORO = p.ID_FORO
                     WHERE p.ID_CLIENTE = :id
                     ORDER BY p.FECHA_PUBLICACION DESC"
                );
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
                $stmt->execute();
                $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $stmt = $conectar->prepare(
                    "SELECT r.CONTENIDO, r.FECHA_PUBLICACION AS FECHA, p.TITULO AS HILO
                     FROM respuesta r
                     INNER JOIN participacion p ON p.ID_PARTICIPACION = r.ID_PARTICIPACION
                     WHERE r.ID_CLIENTE = :id
                     ORDER BY r.FECHA_PUBLICACION DESC"
                );
                $stmt->bindValue(':id', $id, PDO::PARAM_INT);
                $stmt->execute();
                $respuestas = $stmt->fetchAll(PDO::FETCH_ASSOC);

                return [
                    'GENERADO' => date('Y-m-d H:i:s'),
                    'cuenta' => $cuenta ?: new stdClass(),
                    'emociones' => $emociones,
                    'publicaciones' => $publicaciones,
                    'respuestas' => $respuestas
                ];
            } catch (Exception $e) {
                throw new Exception("Error al exportar los datos: " . $e->getMessage());
            }
        }
    }
?>
