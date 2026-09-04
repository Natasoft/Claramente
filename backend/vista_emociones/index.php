<?php
    require_once 'emocionController.php';
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');

    try{
         if($_SERVER["REQUEST_METHOD"]=="GET"){
            $id = $_GET['id'] ?? null;
            $Emociones = new emocionController();
            $result = $Emociones->obtenerEmociones($id);
            if(count($result) > 0){
                //echo json_encode($result);   
                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));
            } else {
                http_response_code(401);
                echo json_encode(["code"=>401,"msg"=>"No se encontraron emociones"]);
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