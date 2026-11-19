<?php
    require_once 'configuracionController.php';
    require_once '../config/SessionManager.php';
    header('Content-Type: application/json');
    // Aquí NO se habilita Access-Control-Allow-Origin: esta API solo la usa tu propia página.

    try{
        // La identidad sale de la sesión del servidor, nunca de un parámetro que envíe el navegador:
        // cada persona solo puede cambiar SU contraseña y descargar SUS datos.
        $sesion = new SessionManager();
        $id_usuario = $_SESSION['id_usuario'] ?? null;

        if(empty($id_usuario)){
            http_response_code(401);
            echo json_encode(["code"=>401,"msg"=>"Sesión no válida o expirada"]);
            exit;
        }

        $Config = new configuracionController();

        if($_SERVER["REQUEST_METHOD"]=="GET"){
            $id = $_GET['id'] ?? null;

            // GET ?id=registro-hoy -> ¿ya registró una emoción hoy? (recordatorio diario)
            if($id == "registro-hoy"){
                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "registrado_hoy" => $Config->registroHoy($id_usuario)));

            // GET ?id=exportar -> copia de mis datos
            } else if($id == "exportar"){
                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $Config->exportarDatos($id_usuario)));

            } else {
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Parámetro id no válido (registro-hoy, exportar)"]);
            }

        } else if($_SERVER["REQUEST_METHOD"]=="POST"){
            $body = json_decode(file_get_contents('php://input'), true);

            if(!is_array($body)){
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Cuerpo de la petición no válido"]);
                exit;
            }

            // POST {accion:"cambiar_clave", actual, nueva}
            if(($body['accion'] ?? null) == "cambiar_clave"){
                // Solo se aceptan textos: si llega otra cosa (una lista), se trata como vacío
                $texto = fn($clave) => (isset($body[$clave]) && is_string($body[$clave])) ? $body[$clave] : '';

                $Config->cambiarClave($id_usuario, $texto('actual'), $texto('nueva'));

                // Se renueva el identificador de la sesión: tras cambiar la contraseña, el anterior ya no sirve
                session_regenerate_id(true);

                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "Contraseña actualizada"));
            } else {
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Acción no válida (cambiar_clave)"]);
            }

        } else{
            http_response_code(405);
            echo json_encode(["code"=>405,"msg"=>"Método no permitido"]);
        }
    } catch (ClaveIncorrectaException $e) {
        // Está identificada, pero la contraseña actual que escribió no es la correcta
        http_response_code(403);
        echo json_encode(["code"=>403,"msg"=>$e->getMessage()]);
    } catch (InvalidArgumentException $e) {
        // Datos incorrectos enviados por la persona (nueva contraseña muy corta, igual a la actual, etc.)
        http_response_code(400);
        echo json_encode(["code"=>400,"msg"=>$e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
    }
?>
