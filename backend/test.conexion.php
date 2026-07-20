<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once "config/Dbconfig.php";

try {

    $conexion = DbConfig::getInstance()->getConnection();

    echo "✅ Conexión exitosa";

} catch (Exception $e) {

    echo "❌ Error: " . $e->getMessage();

}