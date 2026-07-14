<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../includes/Database.php';

$email = 'wk12100000@gmail.com';
$password = password_hash('121koko9a', PASSWORD_DEFAULT);

// Update admin user (id=1)
$existing = Database::fetch("SELECT id FROM users WHERE email = ?", ['test@test.com']);
if ($existing) {
    Database::execute("UPDATE users SET email = ?, password = ? WHERE id = ?", [$email, $password, $existing['id']]);
    echo "Admin updated: email=$email\n";
} else {
    // Try by id
    Database::execute("UPDATE users SET email = ?, password = ? WHERE id = 1", [$email, $password]);
    echo "Admin by ID 1 updated\n";
}
