<?php
class Database {
    private static ?PDO $instance = null;

    public static function getInstance(): PDO {
        if (self::$instance === null) {
            try {
                $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
                $opts = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];
                // TiDB wymaga TLS
                $caPaths = [
                    '/etc/ssl/certs/ca-certificates.crt',
                    '/etc/pki/tls/certs/ca-bundle.crt',
                    '/etc/ssl/ca-bundle.pem',
                    '/etc/pki/tls/cacert.pem',
                ];
                $caFile = null;
                foreach ($caPaths as $p) { if (file_exists($p)) { $caFile = $p; break; } }
                if ($caFile) {
                    if (class_exists('Pdo\\Mysql')) {
                        $opts[constant('Pdo\\Mysql::ATTR_SSL_CA')] = $caFile;
                        $opts[constant('Pdo\\Mysql::ATTR_SSL_VERIFY_SERVER_CERT')] = false;
                    } else {
                        @$opts[PDO::MYSQL_ATTR_SSL_CA] = $caFile;
                        @$opts[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
                    }
                }
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $opts);
            } catch (PDOException $e) {
                $msg = $e->getMessage();
                Logger::error('Database connection failed: ' . $msg, ['host' => DB_HOST, 'db' => DB_NAME, 'port' => DB_PORT]);
                Response::error(500, 'Database: ' . $msg);
                exit;
            }
        }
        return self::$instance;
    }

    public static function query(string $sql, array $params = []): PDOStatement {
        $stmt = self::getInstance()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public static function fetch(string $sql, array $params = []): ?array {
        return self::query($sql, $params)->fetch() ?: null;
    }

    public static function fetchAll(string $sql, array $params = []): array {
        return self::query($sql, $params)->fetchAll();
    }

    public static function insert(string $sql, array $params = []): int {
        self::query($sql, $params);
        return (int) self::getInstance()->lastInsertId();
    }

    public static function execute(string $sql, array $params = []): int {
        $stmt = self::query($sql, $params);
        return $stmt->rowCount();
    }
}
