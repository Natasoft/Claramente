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
                // Manejo de errores: podrías loguear o lanzar una excepción personalizada
                throw new Exception("Error al realizar la consulta: " . $e->getMessage());
            }
        }
    }
?>