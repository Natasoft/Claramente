<?php
    require_once 'recomendacionController.php';
    require_once '../config/SessionManager.php';
    header('Content-Type: application/json');
    // Aquí NO se habilita Access-Control-Allow-Origin: esta API solo la usa tu propia página.

    try{
        // La persona se identifica por la sesión del servidor, nunca por un número que envíe el navegador:
        // la frase depende de su última emoción, que es un dato sensible.
        $sesion = new SessionManager();
        $id_usuario = $_SESSION['id_usuario'] ?? null;

        if(empty($id_usuario)){
            http_response_code(401);
            echo json_encode(["code"=>401,"msg"=>"Sesión no válida o expirada"]);
            exit;
        }

        if($_SERVER["REQUEST_METHOD"]=="GET"){
            $Recomendaciones = new recomendacionController();
            $result = $Recomendaciones->obtenerSugerenciaPorUsuario($id_usuario);

            if(count($result) > 0){
                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));
            } else {
                http_response_code(404);
                echo json_encode(["code"=>404,"msg"=>"No hay recomendaciones para tu emoción más reciente"]);
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
