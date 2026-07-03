<?php
$host = "127.0.0.1";
$usuario = "userdbclaramente";
$contrasena = "@ClM3306/¿";
$base_de_datos = "bdclaramente";

// Crear la conexión
$conexion = mysqli_connect($host, $usuario, $contrasena, $base_de_datos);

// Verificar la conexión
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}
echo "¡Conexión exitosa!";
?>