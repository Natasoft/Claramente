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

        $Moderacion = new moderacionController();

        if($_SERVER["REQUEST_METHOD"]=="GET"){
            $id = $_GET['id'] ?? null;
            $id_foro = $_GET['id_foro'] ?? null;

            // GET ?id=permisos -> ¿puede moderar? ¿es administrador? ¿qué foros?
            if($id == "permisos"){
                $permisos = $Moderacion->obtenerPermisos($id_usuario);

                http_response_code(200);
                echo json_encode(array(
                    "code"=>200,
                    "msg"=>"OK",
                    "es_moderador"=>$permisos['es_moderador'],
                    "es_administrador"=>$permisos['es_administrador'],
                    "datos"=>$permisos['foros']
                ));

            // GET ?id=resumen[&id_foro=2] -> pendientes, aprobadas y rechazadas
            } else if($id == "resumen"){
                $result = $Moderacion->obtenerResumen($id_usuario, $id_foro);

                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));

            // GET ?id=publicaciones&estado=pendientes|aprobadas|rechazadas[&id_foro=2]
            } else if($id == "publicaciones"){
                $estado = $_GET['estado'] ?? 'pendientes';
                if(!in_array($estado, ['pendientes', 'aprobadas', 'rechazadas'])){
                    $estado = 'pendientes';
                }
                $result = $Moderacion->listarPublicaciones($id_usuario, $id_foro, $estado);

                // Una lista vacía es un estado válido (no hay nada en esa bandeja), no un error
                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result['publicaciones'], "hay_mas" => $result['hay_mas']));

            // GET ?id=publicacion&id_participacion=5 -> una publicación completa
            } else if($id == "publicacion"){
                $id_participacion = $_GET['id_participacion'] ?? null;
                if(empty($id_participacion)){
                    http_response_code(400);
                    echo json_encode(["code"=>400,"msg"=>"Falta id_participacion"]);
                    exit;
                }

                $result = $Moderacion->obtenerPublicacion($id_usuario, $id_participacion);

                if(count($result) > 0){
                    http_response_code(200);
                    echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));
                } else {
                    http_response_code(404);
                    echo json_encode(["code"=>404,"msg"=>"No se encontró la publicación"]);
                }

            } else {
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Parámetro id no válido (permisos, resumen, publicaciones, publicacion)"]);
            }

        } else if($_SERVER["REQUEST_METHOD"]=="POST"){
            $body = json_decode(file_get_contents('php://input'), true);

            if(!is_array($body)){
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Cuerpo de la petición no válido"]);
                exit;
            }

            $accion = $body['accion'] ?? null;

            // POST {accion:"aprobar"|"rechazar", id_participacion, observacion}
            if($accion == "aprobar" || $accion == "rechazar"){
                $id_participacion = $body['id_participacion'] ?? null;
                $observacion = $body['observacion'] ?? '';

                if(empty($id_participacion)){
                    http_response_code(400);
                    echo json_encode(["code"=>400,"msg"=>"Falta id_participacion"]);
                    exit;
                }

                $Moderacion->revisar($id_usuario, $id_participacion, $accion, $observacion);

                http_response_code(200);
                echo json_encode(array(
                    "code"=>200,
                    "msg"=>$accion == "aprobar" ? "Publicación aprobada" : "Publicación rechazada"
                ));

            } else {
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Acción no válida (aprobar, rechazar)"]);
            }

        } else{
            http_response_code(405);
            echo json_encode(["code"=>405,"msg"=>"Método no permitido"]);
        }
    } catch (InvalidArgumentException $e) {
        // Datos incorrectos enviados por la persona (falta el motivo del rechazo, publicación inexistente, etc.)
        http_response_code(400);
        echo json_encode(["code"=>400,"msg"=>$e->getMessage()]);
    } catch (AccesoDenegadoException $e) {
        // La persona está identificada, pero no modera ese foro
        http_response_code(403);
        echo json_encode(["code"=>403,"msg"=>$e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
    }
?>
