<?php
$host = 'gateway01.eu-central-1.prod.aws.tidbcloud.com';
$port = 4000;
$user = '2DjDjVW9rUBDV85.root';
$pass = 'zr67xuLGler11xgB';

$ca = 'C:\Users\gracz\AppData\Local\Temp\opencode\ca-tidb.pem';
$sslOpts = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::MYSQL_ATTR_SSL_CA => $ca,
    PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
];

try {
    // Najpierw połącz bez bazy, żeby stworzyć bazę
    $pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $user, $pass, $sslOpts);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS vexcenter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database 'vexcenter' created/verified\n";
    $pdo = null;

    // Połącz do bazy vexcenter
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=vexcenter;charset=utf8mb4", $user, $pass, $sslOpts);

    $sql = file_get_contents(__DIR__ . '/schema.sql');
    $statements = explode(';', $sql);
    foreach ($statements as $stmt) {
        $stmt = trim($stmt);
        if ($stmt) {
            try {
                $pdo->exec($stmt);
                echo "OK: " . substr($stmt, 0, 60) . "...\n";
            } catch (PDOException $e) {
                // Ignoruj "already exists" dla tabel/indexów
                if (strpos($e->getMessage(), 'already exists') !== false || strpos($e->getMessage(), 'Duplicate') !== false) {
                    echo "SKIP (exists): " . substr($stmt, 0, 60) . "...\n";
                } else {
                    throw $e;
                }
            }
        }
    }

    // Dodaj brakującą kolumnę
    try {
        $pdo->exec("ALTER TABLE games ADD COLUMN game_file VARCHAR(500) DEFAULT NULL AFTER thumbnail");
        echo "OK: ALTER TABLE games ADD game_file\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate') !== false) {
            echo "SKIP: game_file already exists\n";
        } else {
            throw $e;
        }
    }

    echo "\nMigration complete!\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
