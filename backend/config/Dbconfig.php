
<?php

class Database
{
    // Instancia única de la clase
    private static $instance = null;

    // Objeto PDO
    private $connection;

    // Datos de conexión
    private $host = "localhost";
    private $dbname = "bd_claramente";
    private $username = "root"; //userdbclaramente";
    private $password = ""; //@Clm3306/¿";
    private $charset = "utf8mb4";

    // Constructor privado
    private function __construct()
    {
        try {

            $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";

            $this->connection = new PDO(
                $dsn,
                $this->username,
                $this->password
            );

            $this->connection->setAttribute(
                PDO::ATTR_ERRMODE,
                PDO::ERRMODE_EXCEPTION
            );

            $this->connection->setAttribute(
                PDO::ATTR_DEFAULT_FETCH_MODE,
                PDO::FETCH_ASSOC
            );

        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }

    // Método Singleton
    public static function getInstance()
    {
        if (self::$instance == null) {
            self::$instance = new Database();
        }

        return self::$instance;
    }

    // Devuelve la conexión PDO
    public function getConnection()
    {
        return $this->connection;
    }
}