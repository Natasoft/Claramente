<?php
    require_once 'moderacionController.php';
    require_once '../config/SessionManager.php';
    header('Content-Type: application/json');
    // Aquí NO se habilita Access-Control-Allow-Origin: esta API solo la usa tu propia página.

    try{
        // La identidad sale de la sesión del servidor (la cookie de sesión no se puede
        // modificar desde el navegador), nunca de un parámetro que envíe el navegador.
        $sesion = new SessionManager();
        $id_usuario = $_SESSION['id_usuario'] ?? null;

        if(empty($id_usuario)){
            http_response_code(401);
            echo json_encode(["code"=>401,"msg"=>"Sesión no válida o expirada"]);
            exit;
        }

        if($_SERVER["REQUEST_METHOD"]=="GET"){
            $id = $_GET['id'] ?? null;

            // GET ?id=permisos -> ¿puede moderar? ¿es administrador? ¿qué foros?
            if($id == "permisos"){
                $Moderacion = new moderacionController();
                $permisos = $Moderacion->obtenerPermisos($id_usuario);

                http_response_code(200);
                echo json_encode(array(
                    "code"=>200,
                    "msg"=>"OK",
                    "es_moderador"=>$permisos['es_moderador'],
                    "es_administrador"=>$permisos['es_administrador'],
                    "datos"=>$permisos['foros']
                ));
            } else {
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Parámetro id no válido"]);
            }

        } else{
            http_response_code(405);
            echo json_encode(["code"=>405,"msg"=>"Método no permitido"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
    }
?>
