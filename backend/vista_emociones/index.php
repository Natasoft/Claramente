<?php
    require_once 'emocionController.php';
    require_once '../config/SessionManager.php';
    header('Content-Type: application/json');
    // Aquí NO se habilita Access-Control-Allow-Origin: esta API solo la usa tu propia página.

    try{
        // La persona se identifica por la sesión del servidor, nunca por un número que envíe el navegador:
        // así nadie puede leer el historial emocional de otra persona cambiando un id.
        $sesion = new SessionManager();
        $id_usuario = $_SESSION['id_usuario'] ?? null;
        $Emociones = new emocionController();

        if($_SERVER["REQUEST_METHOD"]=="GET"){
            $id = (isset($_GET['id']) && is_string($_GET['id'])) ? $_GET['id'] : null;

            // Datos personales: historial (id=*) y nivel de alerta (id=alerta)
            if($id == "*" || $id == "alerta"){
                if(empty($id_usuario)){
                    http_response_code(401);
                    echo json_encode(["code"=>401,"msg"=>"Sesión no válida o expirada"]);
                    exit;
                }

                $result = ($id == "*")
                    ? $Emociones->obtenerEmocionesUsuario($id_usuario)
                    : $Emociones->obtenerNivelAlerta($id_usuario);

                // Una lista vacía es un estado válido (aún no hay registros), no un error
                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));

            // Catálogo de emociones (no es un dato personal)
            } else {
                $result = $Emociones->obtenerEmociones($id);

                if(count($result) > 0){
                    http_response_code(200);
                    echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));
                } else {
                    http_response_code(404);
                    echo json_encode(["code"=>404,"msg"=>"No se encontraron emociones"]);
                }
            }

        } else if($_SERVER["REQUEST_METHOD"]=="POST"){
            if(empty($id_usuario)){
                http_response_code(401);
                echo json_encode(["code"=>401,"msg"=>"Sesión no válida o expirada"]);
                exit;
            }

            $body = json_decode(file_get_contents('php://input'), true);
            if(!is_array($body)){
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Cuerpo de la petición no válido"]);
                exit;
            }

            $id_emocion = (int) ($body['id_emocion'] ?? 0);
            $intensidad = (int) ($body['intensidad'] ?? 0);
            $comentario = (isset($body['comentario']) && is_string($body['comentario'])) ? $body['comentario'] : '';

            // Se ignora cualquier id_usuario que llegue en el cuerpo: manda la sesión
            if($id_emocion < 1 || $intensidad < 1 || $intensidad > 10){
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Faltan datos o la intensidad no es válida (1 a 10)"]);
                exit;
            }

            $Emociones->registrarEmocion($id_emocion, $intensidad, $comentario, $id_usuario);

            http_response_code(200);
            echo json_encode(array("code"=>200, "msg" => "Registro guardado correctamente"));

        } else{
            http_response_code(405);
            echo json_encode(["code"=>405,"msg"=>"Método no permitido"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
    }
?>
