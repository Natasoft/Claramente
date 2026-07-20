<?php
    include_once '../config/DbConfig.php';

    class logincontroller{
        
        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        public function autenticar($usuario, $password) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                // Preparar la consulta para verificar el usuario y la contraseña
                $stmt = $conectar->prepare("SELECT * FROM usuario WHERE User = :usuario AND Clave = :password");
                $stmt->bindParam(':usuario', $usuario);
                $stmt->bindParam(':password', $password);
                $stmt->execute();

                // Obtener el resultado
                $result = $stmt->fetchAll();

                return $result;
            } catch (Exception $e) {
                // Manejo de errores: podrías loguear o lanzar una excepción personalizada
                throw new Exception("Error al realizar la autenticación: " . $e->getMessage());
            }
        }
    }
?>