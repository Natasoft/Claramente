<?php
    include_once '../config/DbConfig.php';

    class moderacionController{

        // Valores de la tabla roles (1 ADMINISTRADOR, 2 MODERADOR, 3 CLIENTE)
        const ROL_ADMINISTRADOR = 1;
        const ROL_MODERADOR = 2;

        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        // Permisos de moderación de un usuario:
        //  - ADMINISTRADOR: puede moderar todos los foros.
        //  - MODERADOR: solo los foros donde figura como foro.ID_MODERADOR.
        //  - Cualquier otro rol (CLIENTE): ninguno.
        // El rol se lee siempre de la base de datos, nunca de lo que envíe el navegador.
        public function obtenerPermisos($id_usuario) {
            try {
                $db = DbConfig::getInstance();
                $conectar = $db->getConnection();

                $stmt = $conectar->prepare("SELECT ID_ROL FROM usuario WHERE ID_USUARIO = :id_usuario");
                $stmt->bindValue(':id_usuario', (int) $id_usuario, PDO::PARAM_INT);
                $stmt->execute();
                $rol = (int) $stmt->fetchColumn(); // 0 si el usuario no existe

                $foros = [];
                if ($rol === self::ROL_ADMINISTRADOR) {
                    $stmt = $conectar->prepare("SELECT ID_FORO, TITULO FROM foro ORDER BY ID_FORO");
                    $stmt->execute();
                    $foros = $stmt->fetchAll(PDO::FETCH_ASSOC);
                } else if ($rol === self::ROL_MODERADOR) {
                    $stmt = $conectar->prepare(
                        "SELECT ID_FORO, TITULO FROM foro WHERE ID_MODERADOR = :id_usuario ORDER BY ID_FORO"
                    );
                    $stmt->bindValue(':id_usuario', (int) $id_usuario, PDO::PARAM_INT);
                    $stmt->execute();
                    $foros = $stmt->fetchAll(PDO::FETCH_ASSOC);
                }

                return [
                    'es_administrador' => $rol === self::ROL_ADMINISTRADOR,
                    'es_moderador' => count($foros) > 0, // puede entrar al panel
                    'foros' => $foros
                ];
            } catch (Exception $e) {
                throw new Exception("Error al consultar los permisos: " . $e->getMessage());
            }
        }
    }
?>
