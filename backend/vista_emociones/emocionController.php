<?php
    include_once '../config/DbConfig.php';

    class emocionController{

        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        public function obtenerEmociones($id) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();
                // Preparar la consulta si se proporciona un ID, de lo contrario, obtener todas las emociones
                if(!empty($id)) {
                    $stmt = $conectar->prepare("SELECT ID_EMOCION, NOMBRE, ICONO FROM tipo_emocion WHERE ID_EMOCION = :id");
                    $stmt->bindParam(':id', $id);
                } else {
                    $stmt = $conectar->prepare("SELECT ID_EMOCION, NOMBRE, ICONO FROM tipo_emocion ORDER BY NOMBRE ASC");
                }
                $stmt->execute();
                $result = $stmt->fetchAll();
                return $result;
            } catch (Exception $e) {
                throw new Exception("Error al realizar la consulta: " . $e->getMessage());
            }
        }

        public function registrarEmocion($id_emocion, $intensidad, $comentario, $id_usuario) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $fecha = date('Y-m-d H:i:s');

                $stmt = $conectar->prepare(
                    "INSERT INTO estado_emocional
                    (FECHA_REG, ID_EMOCION, INTENSIDAD, COMENTARIO, ID_USUARIO)
                    VALUES
                    (:fecha, :id_emocion, :intensidad, :comentario, :id_usuario)"
                );

                $stmt->bindParam(':fecha', $fecha);
                $stmt->bindParam(':id_emocion', $id_emocion);
                $stmt->bindParam(':intensidad', $intensidad);
                $stmt->bindParam(':comentario', $comentario);
                $stmt->bindParam(':id_usuario', $id_usuario);

                $stmt->execute();

                return true;

            } catch (Exception $e) {
                throw new Exception(
                    "Error al guardar el registro emocional: " . $e->getMessage()
                );
            }
        }
    }
?>
