<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/Database.php';

$email = 'Admin@vexcenter.pl';
$password = password_hash('121koko9a', PASSWORD_DEFAULT);
$username = 'Admin';

try {
    Database::execute("SET FOREIGN_KEY_CHECKS = 0");

    $tables = ['users', 'developer_applications', 'messages', 'notifications', 'game_installations', 'reviews'];
    foreach ($tables as $table) {
        try {
            Database::execute("DELETE FROM $table");
            echo "Cleared: $table\n";
        } catch (Exception $e) {
            echo "Skip $table: " . $e->getMessage() . "\n";
        }
    }

    Database::execute("SET FOREIGN_KEY_CHECKS = 1");

    Database::execute(
        "INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, 'admin', NOW())",
        [$username, $email, $password]
    );

    $userId = Database::lastInsertId();
    echo "Admin created: id=$userId, email=$email\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
