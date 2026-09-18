<?php
    require_once 'emocionController.php';
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');

    try{
        if($_SERVER["REQUEST_METHOD"]=="GET"){
            $id = $_GET['id'] ?? null;
            $id_usuario = $_GET['id_usuario'] ?? null;
            $Emociones = new emocionController();
            if(!empty($id_usuario) && $id=="*"){
                $result = $Emociones->obtenerEmocionesUsuario($id_usuario);
            } else {
                $result = $Emociones->obtenerEmociones($id);   
            }
            
            if(count($result) > 0){
                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));
            } else {
                http_response_code(401);
                echo json_encode(["code"=>401,"msg"=>"No se encontraron emociones"]);
            }

        } else if($_SERVER["REQUEST_METHOD"]=="POST"){
            $body = json_decode(file_get_contents('php://input'), true);

            $id_emocion = $body['id_emocion'] ?? null;
            $intensidad = $body['intensidad'] ?? null;
            $comentario = $body['comentario'] ?? '';
            $id_usuario = $body['id_usuario'] ?? null;

            if(empty($id_emocion) || empty($intensidad) || empty($id_usuario)){
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Faltan datos requeridos (id_emocion, intensidad, id_usuario)"]);
                exit;
            }

            $Emociones = new emocionController();
            $Emociones->registrarEmocion($id_emocion, $intensidad, $comentario, $id_usuario);

            http_response_code(200);
            echo json_encode(array("code"=>200, "msg" => "Registro guardado correctamente"));

        } else{
            http_response_code(401);
            echo json_encode(["code"=>401,"msg"=>"No autorizado"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
    }
?>
