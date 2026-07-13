<?php
$user = Auth::requireAuth();

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? $user['username']);

$existing = Database::fetch("SELECT id FROM users WHERE username = ? AND id != ?", [$username, $user['id']]);
if ($existing) Response::error(409, 'Username already taken');

Database::execute("UPDATE users SET username = ? WHERE id = ?", [$username, $user['id']]);

Response::success(['username' => $username], 'Profile updated');
