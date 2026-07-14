<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/Database.php';

$email = 'Admin@vexcenter.pl';
$password = password_hash('121koko9a', PASSWORD_DEFAULT);
$username = 'Admin';

try {
    // Disable foreign key checks
    Database::execute("SET FOREIGN_KEY_CHECKS = 0");

    // Truncate all user-related tables
    $tables = ['users', 'developer_applications', 'friendships', 'messages', 'notifications', 'game_installations', 'reviews', 'library_games'];
    foreach ($tables as $table) {
        try {
            Database::execute("DELETE FROM $table");
            echo "Cleared: $table\n";
        } catch (Exception $e) {
            echo "Skip $table: " . $e->getMessage() . "\n";
        }
    }

    Database::execute("SET FOREIGN_KEY_CHECKS = 1");

    // Create admin user
    Database::execute(
        "INSERT INTO users (username, email, password, role, email_verified, created_at) VALUES (?, ?, ?, 'admin', 1, NOW())",
        [$username, $email, $password]
    );

    $userId = Database::lastInsertId();
    echo "Admin created: id=$userId, email=$email\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
