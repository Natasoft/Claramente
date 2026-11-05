<?php
    require_once 'registroController.php';
    header('Content-Type: application/json');
    // Aquí NO se habilita Access-Control-Allow-Origin: esta API solo la usa tu propia página.

    try{
        if($_SERVER["REQUEST_METHOD"]=="POST"){
            $body = json_decode(file_get_contents('php://input'), true);

            if(!is_array($body)){
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Cuerpo de la petición no válido"]);
                exit;
            }

            // Solo se aceptan textos: si llega otra cosa (una lista, un número), se trata como vacío
            $texto = fn($clave) => (isset($body[$clave]) && is_string($body[$clave])) ? $body[$clave] : '';

            $Registro = new registroController();
            $Registro->registrar(
                $texto('nombres'),
                $texto('apellidos'),
                $texto('email'),
                $texto('password'),
                $body['autorizacion'] ?? false
            );
            // Nota: el rol no se lee del cuerpo de la petición; lo fija el controlador.

            http_response_code(200);
            echo json_encode(array("code"=>200, "msg" => "Cuenta creada correctamente"));

        } else{
            http_response_code(405);
            echo json_encode(["code"=>405,"msg"=>"Método no permitido"]);
        }
    } catch (CorreoDuplicadoException $e) {
        // El correo ya tiene una cuenta
        http_response_code(409);
        echo json_encode(["code"=>409,"msg"=>$e->getMessage()]);
    } catch (InvalidArgumentException $e) {
        // Datos incorrectos enviados por la persona
        http_response_code(400);
        echo json_encode(["code"=>400,"msg"=>$e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
    }
?>
