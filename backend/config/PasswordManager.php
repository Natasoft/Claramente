<?php

/**
 * Reglas de contraseñas del proyecto, en un solo lugar.
 * Lo usan el login (logincontroller.php) y el registro (registroController.php).
 *
 * Las contraseñas nuevas se guardan con password_hash (bcrypt). Las cuentas antiguas guardan
 * un MD5 (32 caracteres): se siguen aceptando y se convierten al hash nuevo la primera vez que
 * su dueño inicia sesión, sin pedirle nada.
 */
class PasswordManager {

    // Reglas para contraseñas NUEVAS (registro). El login no las exige,
    // para no bloquear cuentas que ya existen.
    const LONGITUD_MINIMA = 8;
    const BYTES_MAXIMOS = 72; // bcrypt solo usa los primeros 72 bytes

    // Crea el hash que se guarda en la base de datos (60 caracteres con bcrypt)
    public static function hashear($plano) {
        return password_hash((string) $plano, PASSWORD_DEFAULT);
    }

    // ¿Es un hash moderno? (bcrypt u otro algoritmo que PHP reconozca)
    public static function esHashModerno($almacenado) {
        return password_get_info((string) $almacenado)['algo'] !== null;
    }

    // ¿Es el MD5 antiguo? (32 caracteres hexadecimales)
    public static function esMd5Antiguo($almacenado) {
        return preg_match('/^[a-f0-9]{32}$/i', (string) $almacenado) === 1;
    }

    /**
     * Comprueba una contraseña escrita contra lo que hay guardado.
     * Devuelve:
     *  - correcta:   true si coincide
     *  - actualizar: true si conviene volver a guardarla con un hash nuevo
     *                (cuenta con MD5 antiguo, o hash moderno con parámetros desactualizados)
     */
    public static function verificar($plano, $almacenado) {
        $plano = (string) $plano;
        $almacenado = (string) $almacenado;

        if (self::esHashModerno($almacenado)) {
            $correcta = password_verify($plano, $almacenado);
            return [
                'correcta' => $correcta,
                'actualizar' => $correcta && password_needs_rehash($almacenado, PASSWORD_DEFAULT)
            ];
        }

        if (self::esMd5Antiguo($almacenado)) {
            // hash_equals compara sin revelar, por el tiempo que tarda, en qué carácter falla
            $correcta = hash_equals(strtolower($almacenado), md5($plano));
            return ['correcta' => $correcta, 'actualizar' => $correcta];
        }

        // Valor vacío o que no se reconoce: nunca deja entrar
        return ['correcta' => false, 'actualizar' => false];
    }

    // Reglas para una contraseña NUEVA. Devuelve el mensaje de error, o null si es válida.
    public static function validarNueva($plano) {
        $plano = (string) $plano;
        if (mb_strlen($plano, 'UTF-8') < self::LONGITUD_MINIMA) {
            return "La contraseña debe tener al menos " . self::LONGITUD_MINIMA . " caracteres";
        }
        if (strlen($plano) > self::BYTES_MAXIMOS) {
            return "La contraseña es demasiado larga (máximo " . self::BYTES_MAXIMOS . " caracteres)";
        }
        return null;
    }

    /**
     * Protección contra un fallo grave: si la columna usuario.PASSWORD todavía mide 50 caracteres,
     * un hash de 60 se guardaría cortado (MySQL de XAMPP no avisa) y esa persona quedaría sin poder entrar.
     * Antes de guardar un hash nuevo se comprueba que quepa entero.
     */
    public static function cabeEnColumna($conectar, $hash) {
        $stmt = $conectar->prepare(
            "SELECT CHARACTER_MAXIMUM_LENGTH
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario' AND COLUMN_NAME = 'PASSWORD'"
        );
        $stmt->execute();
        return (int) $stmt->fetchColumn() >= strlen((string) $hash);
    }
}
