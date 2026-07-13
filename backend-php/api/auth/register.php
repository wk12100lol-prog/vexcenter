<?php
if ($method !== 'post') Response::error(405, 'Method not allowed');

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

$errors = [];
if (strlen($username) < 3) $errors[] = 'Username must be at least 3 characters';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Invalid email address';
if (strlen($password) < 6) $errors[] = 'Password must be at least 6 characters';
if (!empty($errors)) Response::error(400, 'Validation failed', $errors);

$existing = Database::fetch("SELECT id FROM users WHERE email = ? OR username = ?", [$email, $username]);
if ($existing) Response::error(409, 'User with this email or username already exists');

$hash = password_hash($password, PASSWORD_DEFAULT);
$userId = Database::insert(
    "INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, 'user', NOW())",
    [$username, $email, $hash]
);

$token = Auth::generateToken(['user_id' => $userId, 'role' => 'user']);

Response::success([
    'token' => $token,
    'user' => [
        'id' => $userId,
        'username' => $username,
        'email' => $email,
        'role' => 'user',
        'avatar' => null,
    ],
], 'Registration successful');
