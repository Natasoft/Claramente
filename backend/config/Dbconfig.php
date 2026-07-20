
<?php

    class DbConfig {
        // Instancia única de la clase (Singleton)
        private static ?DbConfig $instance = null;
        
        // Objeto PDO para la conexión
        private ?PDO $connection = null;
        
        // Configuración de la base de datos
        private string $host;
        private string $user;
        private string $password;
        private string $database;
        
        // Opciones de PDO (para mejorar el rendimiento y seguridad)
        private array $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,        // Lanza excepciones en errores
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,   // Fetch por defecto como array asociativo
            PDO::ATTR_EMULATE_PREPARES => false,                // Desactiva emulación de prepares (usa nativos)
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4" // Juego de caracteres UTF-8
        ];
        
        // Constructor privado para evitar instanciación externa
        private function __construct()
        {
            $this->host = "127.0.0.1";
            $this->user = "root" ; //"userdbclaramente";
            $this->password = "" ; //"@/BpMpil6hsmrz!R";
            $this->database = "bd_claramente";
            
            $this->connect();
        }
                
        // Método estático para obtener la instancia única
        public static function getInstance(): DbConfig
        {
            if (self::$instance === null) {
                self::$instance = new self();
            }
            return self::$instance;
        }
        
        // Establece la conexión PDO
        private function connect(): void
        {
            try {
                $dsn = "mysql:host={$this->host};dbname={$this->database};charset=utf8mb4";
                $this->connection = new PDO($dsn, $this->user, $this->password, $this->options);
            } catch (PDOException $e) {
                // Manejo de errores: podrías loguear o lanzar una excepción personalizada
                die("Error de conexión a la base de datos: " . $e->getMessage());
            }
        }
        
        // Obtiene la conexión PDO activa
        public function getConnection(): PDO
        {
            if ($this->connection === null) {
                $this->connect();
            }
            return $this->connection;
        }
        
        
       // Clonación prohibida para mantener el Singleton
private function __clone() {}

// Deserialización prohibida para mantener el Singleton
public function __wakeup()
{
    throw new Exception("No se puede deserializar el Singleton");
}

        // (Opcional) Método para cerrar la conexión manualmente
        public function closeConnection(): void
        {
            $this->connection = null;
        }
        
        // (Opcional) Método para ejecutar consultas preparadas de manera fácil
        public function prepare(string $sql): PDOStatement
        {
            return $this->getConnection()->prepare($sql);
        }
        
        // (Opcional) Método para ejecutar consultas directas (usar con precaución)
        public function query(string $sql): PDOStatement
        {
            return $this->getConnection()->query($sql);
        }
    }
?>