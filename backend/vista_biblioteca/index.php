<?php
    require_once 'bibliotecaController.php';
    require_once '../config/SessionManager.php';
    header('Content-Type: application/json');
    // Aquí NO se habilita Access-Control-Allow-Origin: esta API solo la usa tu propia página.

    try{
        // La identidad sale de la sesión del servidor (la cookie de sesión no se puede
        // modificar desde el navegador), nunca de un parámetro que envíe el navegador.
        // "Qué emoción tengo hoy" es un dato sensible: no debe poder pedirse con el id de otra persona.
        $sesion = new SessionManager();
        $id_usuario = $_SESSION['id_usuario'] ?? null;

        if(empty($id_usuario)){
            http_response_code(401);
            echo json_encode(["code"=>401,"msg"=>"Sesión no válida o expirada"]);
            exit;
        }

        if($_SERVER["REQUEST_METHOD"]=="GET"){
            $id = $_GET['id'] ?? null;
            $Biblioteca = new bibliotecaController();

            // GET ?id=para-ti -> recursos de tu emoción más reciente
            if($id == "para-ti"){
                $result = $Biblioteca->obtenerParaTi($id_usuario);

                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "emocion" => $result['emocion'], "datos" => $result['recursos']));

            // GET ?id=temas -> los foros que tienen recursos (filtros de la biblioteca)
            } else if($id == "temas"){
                $result = $Biblioteca->obtenerTemas();

                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));

            // GET ?id=por-temas -> la biblioteca agrupada por foro (vista "Todos")
            } else if($id == "por-temas"){
                $result = $Biblioteca->obtenerPorTemas();

                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));

            // GET ?id=recursos[&id_foro=2][&q=texto][&pagina=1] -> lista de recursos de un tema o de una búsqueda
            } else if($id == "recursos"){
                // Solo se aceptan textos: si llega otra cosa (una lista), se trata como vacío
                $id_foro = (isset($_GET['id_foro']) && is_string($_GET['id_foro'])) ? $_GET['id_foro'] : null;
                $busqueda = (isset($_GET['q']) && is_string($_GET['q'])) ? mb_substr(trim($_GET['q']), 0, 100, 'UTF-8') : '';
                $pagina = (isset($_GET['pagina']) && is_string($_GET['pagina'])) ? $_GET['pagina'] : 1;

                $result = $Biblioteca->listarRecursos($id_foro, $busqueda, $pagina);

                // Una lista vacía es un estado válido (aún no hay recursos), no un error
                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result['recursos'], "hay_mas" => $result['hay_mas']));

            // GET ?id=sugeridos -> 3 recursos al azar para la tarjeta lateral
            } else if($id == "sugeridos"){
                $result = $Biblioteca->obtenerSugeridos();

                http_response_code(200);
                echo json_encode(array("code"=>200, "msg" => "OK", "datos" => $result));

            } else {
                http_response_code(400);
                echo json_encode(["code"=>400,"msg"=>"Parámetro id no válido (para-ti, temas, por-temas, recursos, sugeridos)"]);
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
