<?php
    require_once 'logincontroller.php';
    require_once '../config/SessionManager.php';
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');

    try{
        if($_SERVER["REQUEST_METHOD"]=="POST"){
            try{
                //Validacion de parametros
                $_POST = json_decode(file_get_contents('php://input'), true);
                // Validar parámetros
                if (!empty($_POST['usuario']) && !empty($_POST['password'])) {
                    $usuario = htmlspecialchars(trim($_POST['usuario']));
                    $password = htmlspecialchars(trim($_POST['password']));
                    //echo "Usuario: $usuario, Contraseña: $password";
                   $controller = new logincontroller();
                    $result = $controller->autenticar($usuario, $password);
                   if(count($result) > 0){
                    $sesion = new SessionManager();
                    $IdToken = $sesion->getSessionToken($result[0]["NOMBRES"], $result[0]["ID_USUARIO"]);
                        //echo json_encode($result);   
                        http_response_code(200);
                        echo json_encode(array("code"=>200, "msg" => "usuario OK", "iduser" => $result[0]["ID_USUARIO"], "user" => $result[0]["NOMBRES"], "token" => $IdToken));
                    } else {
                        http_response_code(203);
                        echo json_encode(array("code"=>203, "msg" => "Las credenciales no son válidas"));
                    }
                                   
                } else {
                    http_response_code(402);
                    echo json_encode(array("code"=>402, "msg" => "Error, faltan parámetros necesarios"));
                }

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
            }
        } else if($_SERVER["REQUEST_METHOD"]=="DELETE"){
            $_POST = json_decode(file_get_contents('php://input'), true);
            //var_dump($_POST['token']);
            $sesion = new SessionManager();
            $token = $_POST['token'] ?? '';            
            $sesion->destroy();
            http_response_code(200);
            echo json_encode(["code"=>200,"msg"=>"Sesión cerrada correctamente"]);
        } else{
            http_response_code(401);
            echo json_encode(["code"=>401,"msg"=>"No autorizado"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
    }
?>