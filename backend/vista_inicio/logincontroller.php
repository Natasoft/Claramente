<?php
    include_once '../config/DbConfig.php';
    include_once '../config/PasswordManager.php';

    class logincontroller{
        
        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        // Verifica el correo y la contraseña.
        // Devuelve [fila del usuario] si son correctos, o [] si no (mismo formato de siempre).
        // $password es la contraseña tal cual la escribió la persona; el navegador ya no la convierte a MD5.
        public function autenticar($usuario, $password) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                // Se busca solo por correo; la contraseña se verifica en PHP, no en la consulta
                $stmt = $conectar->prepare(
                    "SELECT ID_USUARIO, NOMBRES, APELLIDOS, EMAIL, ID_ROL, PASSWORD
                     FROM usuario WHERE EMAIL = :usuario"
                );
                $stmt->bindParam(':usuario', $usuario);
                $stmt->execute();
                $fila = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$fila) {
                    // El correo no existe. Se gasta el mismo tiempo que una verificación real,
                    // para que por la demora no se pueda adivinar qué correos están registrados.
                    PasswordManager::hashear($password);
                    return [];
                }

                $resultado = PasswordManager::verificar($password, $fila['PASSWORD']);
                if (!$resultado['correcta']) {
                    return [];
                }

                // Cuenta con MD5 antiguo (o hash desactualizado): se guarda el hash nuevo
                if ($resultado['actualizar']) {
                    $this->actualizarHash($conectar, $fila['ID_USUARIO'], $fila['PASSWORD'], $password);
                }

                unset($fila['PASSWORD']); // la contraseña nunca sale de aquí
                return [$fila];
            } catch (Exception $e) {
                // Manejo de errores: podrías loguear o lanzar una excepción personalizada
                throw new Exception("Error al realizar la autenticación: " . $e->getMessage());
            }
        }

        // Guarda el hash nuevo. Si algo falla, el inicio de sesión sigue adelante
        // y la cuenta conserva su hash anterior, que sigue funcionando.
        private function actualizarHash($conectar, $id_usuario, $hash_anterior, $password) {
            try {
                $nuevo = PasswordManager::hashear($password);

                // Si la columna aún no se amplió, no se toca nada (se guardaría cortado)
                if (!PasswordManager::cabeEnColumna($conectar, $nuevo)) {
                    error_log("usuario.PASSWORD es muy corta: ejecuta el ALTER TABLE del script de contraseñas");
                    return;
                }

                // "AND PASSWORD = :anterior" evita pisar un cambio hecho al mismo tiempo en otra sesión
                $stmt = $conectar->prepare(
                    "UPDATE usuario SET PASSWORD = :nuevo
                     WHERE ID_USUARIO = :id AND PASSWORD = :anterior"
                );
                $stmt->bindValue(':nuevo', $nuevo);
                $stmt->bindValue(':id', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->bindValue(':anterior', $hash_anterior);
                $stmt->execute();
            } catch (Exception $e) {
                error_log("No se pudo actualizar el hash de la contraseña: " . $e->getMessage());
            }
        }
    }
?>
