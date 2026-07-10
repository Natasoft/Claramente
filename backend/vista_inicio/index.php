<?php

try {

if($_SERVER['REQUEST_METHOD'] == 'POST') {
    $usuario = $_POST['usuario'];
    $contrasena = $_POST['contrasena'];

    http_response_code(200);
    echo json_encode(["code" => 200, "message" => "Inicio de sesion exitoso"]);
    
else{
    http_response_code(401);
    echo json_encode(["code" => 401, "message" => "No autorizado"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["code" => 500, "message" => "Error interno del servidor"]);
    
} else{
    http_response_code(401);
    echo json_encode(["code" => 401, "message" => "No autorizado"]);
}


    // Aquí puedes agregar la lógica para verificar las credenciales del usuario
    // Por ejemplo, puedes consultar la base de datos para validar el usuario y la contraseña

    // Ejemplo de respuesta (puedes personalizarla según tus necesidades)
    if($usuario === 'admin' && $contrasena === 'admin123') {
        echo "Inicio de sesión exitoso";
    } else {
        echo "Usuario o contraseña incorrectos";
    }
} else {
    echo "Método de solicitud no permitido";
}
?>