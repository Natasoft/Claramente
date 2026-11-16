<?php
    require_once 'perfilController.php';
    require_once '../config/SessionManager.php';
    header('Content-Type: application/json');
    // Aquí NO se habilita Access-Control-Allow-Origin: esta API solo la usa tu propia página.

    try{
        // La identidad sale de la sesión del servidor, nunca de un parámetro que envíe el navegador:
        // cada persona solo puede ver y cambiar SU propio perfil.
        $sesion = new SessionManager();
        $id_usuario = $_SESSION['id_usuario'] ?? null;

        if(empty($id_usuario)){
            http_response_code(401);
            echo json_encode(["code"=>401,"msg"=>"Sesión no válida o expirada"]);
            exit;
        }

        $Perfil = new perfilController();

        if($_SERVER["REQUEST_METHOD"]=="GET"){
            $id = $_GET['id'] ?? null;

            // GET ?id=perfil -> mis datos y mis estadísticas
            if($id == "perfil"){
                $result = $Perfil->obtenerPerfil($id_usuario);

                if(count($result) > 0){
                    http_response_code(200);
                    echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));
                } else {
                    http_response_code(404);
                    echo json_encode(["code"=>404,"msg"=>"No se encontró el perfil"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Parámetro id no válido (perfil)"]);
            }

        } else if($_SERVER["REQUEST_METHOD"]=="POST"){
            $body = json_decode(file_get_contents('php://input'), true);

            if(!is_array($body)){
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Cuerpo de la petición no válido"]);
                exit;
            }

            // POST {accion:"actualizar", nombres, apellidos}
            if(($body['accion'] ?? null) == "actualizar"){
                // Solo se aceptan textos: si llega otra cosa (una lista), se trata como vacío
                $texto = fn($clave) => (isset($body[$clave]) && is_string($body[$clave])) ? $body[$clave] : '';

                $guardado = $Perfil->actualizarPerfil($id_usuario, $texto('nombres'), $texto('apellidos'));

                // El saludo de la sesión usa el nombre: se mantiene al día
                $_SESSION['usuario'] = $guardado['NOMBRES'];

                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "Perfil actualizado", "datos" => [$guardado]));
            } else {
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Acción no válida (actualizar)"]);
            }

        } else{
            http_response_code(405);
            echo json_encode(["code"=>405,"msg"=>"Método no permitido"]);
        }
    } catch (InvalidArgumentException $e) {
        // Datos incorrectos enviados por la persona (nombre con números, etc.)
        http_response_code(400);
        echo json_encode(["code"=>400,"msg"=>$e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
    }
?>
