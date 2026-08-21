<?php

class SessionManager {
    
    /**
     * Inicializa la sesión de forma segura si no ha sido iniciada.
     */
    public function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            // Configuración de seguridad para las cookies de sesión
            session_start([
                'cookie_lifetime' => 0,
                'cookie_secure'   => false, // Cambiar a false si no se usa HTTPS en desarrollo
                'cookie_httponly' => true,
                'cookie_samesite' => 'Strict'
            ]);
        }
    }

    /**
     * Genera, almacena y retorna un token único para la sesión actual.
     * @return string Token único de 64 caracteres.
     */
    public function getSessionToken($user, $id_usuario): string {
        if (!isset($_SESSION['session_token'])) {
            // Genera 32 bytes aleatorios y los convierte a hash usando BLAKE2b
            $randomBytes = bin2hex(random_bytes(32));
            $_SESSION['session_token'] = $randomBytes;
            $_SESSION['usuario'] = $user;
            $_SESSION['id_usuario'] = $id_usuario;
        }
        return $_SESSION['session_token'];
    }

    /**
     * Regenera el ID de la sesión y actualiza el token para prevenir fijación de sesiones.
     */
    public function refreshSession(): void {
        session_regenerate_id(true);
        unset($_SESSION['session_token']);
        $this->getUniqueToken();
    }

    /**
     * Destruye completamente la sesión actual.
     */
    public function destroy(): void {
        session_unset();
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
    }
}