<?php
    include_once '../config/DbConfig.php';
    include_once '../config/PasswordManager.php';

    // Se lanza cuando el correo ya tiene una cuenta
    class CorreoDuplicadoException extends Exception {}

    class registroController{

        // Valor de la tabla roles: toda cuenta nueva nace como CLIENTE (rol 3).
        // El rol NUNCA se recibe del navegador: si no, cualquiera podría registrarse como administrador.
        const ROL_CLIENTE = 3;

        // Si es true, el servidor exige que se haya marcado la autorización de datos.
        // Si quitas la casilla de Registro.html, ponlo en false.
        const EXIGIR_AUTORIZACION = true;

        // Mismas reglas que el login (inicio.js): no se puede registrar un correo que el login rechazaría
        const REGEX_CORREO = '/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/';
        // Nombres: letras (con tildes y ñ), espacios, punto, apostrofe y guion
        const REGEX_NOMBRE = '/^[\p{L}\p{M}][\p{L}\p{M} .\'-]*$/u';

        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        private function nombreValido($texto) {
            $largo = mb_strlen($texto, 'UTF-8');
            return $largo >= 2 && $largo <= 30 && preg_match(self::REGEX_NOMBRE, $texto) === 1;
        }

        // Crea una cuenta nueva. $password es la contraseña tal cual la escribió la persona:
        // aquí se valida y se guarda con password_hash (nunca se guarda ni se registra en claro).
        public function registrar($nombres, $apellidos, $email, $password, $autorizacion) {
            // Se limpian los textos: sin espacios sobrantes, y el correo siempre en minúsculas.
            // La contraseña NO se toca: los espacios y símbolos forman parte de ella.
            $nombres = preg_replace('/ {2,}/', ' ', trim((string) $nombres));
            $apellidos = preg_replace('/ {2,}/', ' ', trim((string) $apellidos));
            $email = mb_strtolower(trim((string) $email), 'UTF-8');
            $password = (string) $password;

            // El servidor valida todo otra vez: lo que valida el navegador no es una garantía
            if (!$this->nombreValido($nombres)) {
                throw new InvalidArgumentException("Los nombres no son válidos");
            }
            if (!$this->nombreValido($apellidos)) {
                throw new InvalidArgumentException("Los apellidos no son válidos");
            }
            if (mb_strlen($email, 'UTF-8') > 100 || preg_match(self::REGEX_CORREO, $email) !== 1) {
                throw new InvalidArgumentException("El correo no es válido");
            }
            $errorPassword = PasswordManager::validarNueva($password);
            if ($errorPassword !== null) {
                throw new InvalidArgumentException($errorPassword);
            }
            if (self::EXIGIR_AUTORIZACION && filter_var($autorizacion, FILTER_VALIDATE_BOOLEAN) !== true) {
                throw new InvalidArgumentException("Debes aceptar la autorización de tratamiento de datos");
            }

            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                // ¿El correo ya tiene una cuenta?
                $stmt = $conectar->prepare("SELECT 1 FROM usuario WHERE EMAIL = :email");
                $stmt->bindValue(':email', $email);
                $stmt->execute();
                if ($stmt->fetchColumn()) {
                    throw new CorreoDuplicadoException("Este correo ya tiene una cuenta");
                }

                // Se calcula el hash y se comprueba que quepa en la columna: si PASSWORD aún mide 50,
                // se guardaría cortado y la cuenta nacería inservible.
                $hash = PasswordManager::hashear($password);
                if (!PasswordManager::cabeEnColumna($conectar, $hash)) {
                    throw new Exception("La columna usuario.PASSWORD es muy corta: ejecuta el ALTER TABLE del script de contraseñas");
                }

                $stmt = $conectar->prepare(
                    "INSERT INTO usuario (NOMBRES, APELLIDOS, EMAIL, PASSWORD, ID_ROL)
                     VALUES (:nombres, :apellidos, :email, :password, :rol)"
                );
                $stmt->bindValue(':nombres', $nombres);
                $stmt->bindValue(':apellidos', $apellidos);
                $stmt->bindValue(':email', $email);
                $stmt->bindValue(':password', $hash);
                $stmt->bindValue(':rol', self::ROL_CLIENTE, PDO::PARAM_INT);
                $stmt->execute();

                return true;
            } catch (CorreoDuplicadoException $e) {
                throw $e;
            } catch (PDOException $e) {
                // Dos registros a la vez con el mismo correo: lo detecta la restricción de único de la tabla
                if (isset($e->errorInfo[1]) && (int) $e->errorInfo[1] === 1062) {
                    throw new CorreoDuplicadoException("Este correo ya tiene una cuenta");
                }
                throw new Exception("Error al crear la cuenta: " . $e->getMessage());
            } catch (Exception $e) {
                throw new Exception("Error al crear la cuenta: " . $e->getMessage());
            }
        }
    }
?>
