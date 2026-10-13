<?php
    require_once 'recomendacionController.php';
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');

    try{
        if($_SERVER["REQUEST_METHOD"]=="GET"){
            $id_usuario = $_GET['id_usuario'] ?? null;

            if(empty($id_usuario)){
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Falta id_usuario"]);
                exit;
            }

            $Recomendaciones = new recomendacionController();
            $result = $Recomendaciones->obtenerSugerenciaPorUsuario($id_usuario);

            if(count($result) > 0){
                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));
            } else {
                http_response_code(401);
                echo json_encode(["code"=>401,"msg"=>"No hay recomendaciones para tu emoción más reciente"]);
            }

        } else{
            http_response_code(401);
            echo json_encode(["code"=>401,"msg"=>"No autorizado"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
    }
?>
