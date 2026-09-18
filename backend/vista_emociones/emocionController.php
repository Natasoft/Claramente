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
                $stmt = $conectar->prepare("CALL guardar_estado_emocional(:id_emocion, :intensidad, :comentario, :id_usuario)");
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

        public function obtenerEmocionesUsuario($id_usuario) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();
                //$stmt = $conectar->prepare("SELECT tp.ID_EMOCION, tp.NOMBRE, COUNT(em.ID_EMOCION) as CANTIDAD, em.FECHA_REG FROM tipo_emocion tp INNER JOIN estado_emocional em ON (em.ID_EMOCION=tp.ID_EMOCION) WHERE em.ID_USUARIO=:id_usuario GROUP BY em.ID_EMOCION ORDER BY CANTIDAD DESC");
                $stmt = $conectar->prepare("SELECT tp.ID_EMOCION, tp.NOMBRE, em.FECHA_REG FROM tipo_emocion tp INNER JOIN estado_emocional em ON (em.ID_EMOCION=tp.ID_EMOCION) WHERE em.ID_USUARIO=:id_usuario ORDER BY em.FECHA_REG");
                $stmt->bindParam(':id_usuario', $id_usuario);
                $stmt->execute();
                $result = $stmt->fetchAll();
                return $result;
            } catch (Exception $e) {
                throw new Exception("Error al realizar la consulta: " . $e->getMessage());
            }
        }
    }
?>
