<?php
    include_once '../config/DbConfig.php';

    class recomendacionController{

        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        public function obtenerSugerenciaPorUsuario($id_usuario) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare("SELECT r.ID_RECOMENDACION, r.TITULO, r.DESCRIPCION, r.URL, r.ID_TIPO_EMOCION FROM recomendaciones r WHERE r.TIPO = 'FRASE' AND r.ID_TIPO_EMOCION = (SELECT em.ID_EMOCION FROM estado_emocional em WHERE em.ID_USUARIO = :id_usuario ORDER BY em.FECHA_REG DESC LIMIT 1) ORDER BY RAND() LIMIT 1");
                $stmt->bindParam(':id_usuario', $id_usuario);
                $stmt->execute();
                return $stmt->fetchAll();
            } catch (Exception $e) {
                throw new Exception("Error al obtener la sugerencia: " . $e->getMessage());
            }
        }
    }
?>
