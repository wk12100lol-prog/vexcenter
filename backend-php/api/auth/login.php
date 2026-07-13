<?php
if ($method !== 'post') Response::error(405, 'Method not allowed');

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) Response::error(400, 'Email and password are required');

$user = Database::fetch("SELECT id, username, email, password, avatar, role FROM users WHERE email = ?", [$email]);
if (!$user || !password_verify($password, $user['password'])) {
    Response::error(401, 'Invalid email or password');
}

$token = Auth::generateToken(['user_id' => $user['id'], 'role' => $user['role']]);
unset($user['password']);

Response::success([
    'token' => $token,
    'user' => $user,
], 'Login successful');
