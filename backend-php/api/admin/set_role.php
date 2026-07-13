<?php
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$userId = (int)($input['user_id'] ?? 0);
$role = trim($input['role'] ?? '');
if (!$userId || !in_array($role, ['user', 'developer', 'admin'])) Response::error(400, 'Valid user_id and role required');

$user = Database::fetch("SELECT id, role FROM users WHERE id = ?", [$userId]);
if (!$user) Response::error(404, 'User not found');
if ($user['role'] === 'admin' && $role !== 'admin') Response::error(403, 'Cannot demote admin');

Database::execute("UPDATE users SET role = ? WHERE id = ?", [$role, $userId]);
Response::success(['message' => "User $userId role changed to $role"]);
