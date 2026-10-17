<?php
    require_once 'foroController.php';
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');

    try{
        $Foros = new foroController();

        if($_SERVER["REQUEST_METHOD"]=="GET"){
            $id = $_GET['id'] ?? null;

            // GET ?id=foros  -> los foros temáticos
            if($id == "foros"){
                $result = $Foros->obtenerForos();
                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));

            // GET ?id=hilos[&id_foro=2][&filtro=recientes|sin-respuesta][&q=texto][&pagina=1]
            } else if($id == "hilos"){
                $id_foro = $_GET['id_foro'] ?? null;
                $filtro = $_GET['filtro'] ?? 'recientes';
                if(!in_array($filtro, ['recientes', 'sin-respuesta'])){
                    $filtro = 'recientes';
                }
                $busqueda = mb_substr(trim($_GET['q'] ?? ''), 0, 100, 'UTF-8');
                $pagina = $_GET['pagina'] ?? 1;

                $result = $Foros->obtenerHilos($id_foro, $filtro, $busqueda, $pagina);

                // Una lista vacía es un estado válido (aún no hay hilos), no un error
                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result['hilos'], "hay_mas" => $result['hay_mas']));

            // GET ?id=hilo&id_hilo=5  -> un hilo con sus respuestas
            } else if($id == "hilo"){
                $id_hilo = $_GET['id_hilo'] ?? null;
                if(empty($id_hilo)){
                    http_response_code(400);
                    echo json_encode(["code"=>400,"msg"=>"Falta id_hilo"]);
                    exit;
                }

                $result = $Foros->obtenerHilo($id_hilo);

                if(count($result) > 0){
                    http_response_code(200);
                    echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));
                } else {
                    http_response_code(404);
                    echo json_encode(["code"=>404,"msg"=>"No se encontró el hilo"]);
                }

            } else {
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Parámetro id no válido (foros, hilos, hilo)"]);
            }

        } else if($_SERVER["REQUEST_METHOD"]=="POST"){
            $body = json_decode(file_get_contents('php://input'), true);

            if(!is_array($body)){
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Cuerpo de la petición no válido"]);
                exit;
            }

            $accion = $body['accion'] ?? null;
            $id_usuario = $body['id_usuario'] ?? null;

            if(empty($id_usuario)){
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Falta id_usuario"]);
                exit;
            }

            // POST {accion:"hilo", id_foro, titulo, contenido, id_usuario}
            if($accion == "hilo"){
                $id_foro = $body['id_foro'] ?? null;
                $titulo = $body['titulo'] ?? '';
                $contenido = $body['contenido'] ?? '';

                if(empty($id_foro)){
                    http_response_code(400);
                    echo json_encode(["code"=>400,"msg"=>"Falta id_foro"]);
                    exit;
                }

                $Foros->crearHilo($id_foro, $titulo, $contenido, $id_usuario);

                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "Tu publicación fue enviada y se mostrará cuando un moderador la revise"));

            // POST {accion:"respuesta", id_hilo, contenido, id_usuario}
            } else if($accion == "respuesta"){
                $id_hilo = $body['id_hilo'] ?? null;
                $contenido = $body['contenido'] ?? '';

                if(empty($id_hilo)){
                    http_response_code(400);
                    echo json_encode(["code"=>400,"msg"=>"Falta id_hilo"]);
                    exit;
                }

                $Foros->crearRespuesta($id_hilo, $contenido, $id_usuario);

                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "Respuesta publicada"));

            } else {
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Acción no válida (hilo, respuesta)"]);
            }

        } else{
            http_response_code(401);
            echo json_encode(["code"=>401,"msg"=>"No autorizado"]);
        }
    } catch (InvalidArgumentException $e) {
        // Datos incorrectos enviados por el usuario (título muy corto, foro inexistente, etc.)
        http_response_code(400);
        echo json_encode(["code"=>400,"msg"=>$e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
    }
?>
