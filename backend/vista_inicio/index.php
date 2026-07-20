<?php
    require_once 'logincontroller.php';
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
                    $controller = new logincontroller();
                    $result = $controller->autenticar($usuario, $password);
                    if(count($result) > 0){
                        http_response_code(200);
                        echo json_encode(array("code"=>200, "msg" => "Usuario OK", "user" => $result[0]["Nombre"]));
                    } else {
                        http_response_code(203);
                        echo json_encode(array("code"=>203, "msg" => "Las credenciales no son válidas"));
                    }
                                   
                } else {
                    http_response_code(402);
                    echo json_encode(array("code"=>401, "msg" => "Error, faltan parámetros necesarios"));
                }

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
            }
        }else{
            http_response_code(401);
            echo json_encode(["code"=>401,"msg"=>"No autorizado"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
    }
?>