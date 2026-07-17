<?php

header("Content-Type: application/json");

try {

if($_SERVER['REQUEST_METHOD'] == 'POST') {
    $datos = json_decode(file_get_contents("php://input"), true);
    $usuario = $datos['usuario'];
    $contrasena = $datos['contrasena'];

    // Prueba temporal
        if ($correo != "" && $password != "") {
    http_response_code(200);
    echo json_encode(["code" => 200, "message" => "Inicio de sesion exitoso"]);
}
} else{
    http_response_code(401);
    echo json_encode(["code" => 401, "message" => "No autorizado"]);

} 

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["code" => 500, "message" => "Error interno del servidor"]);
    
}


?>