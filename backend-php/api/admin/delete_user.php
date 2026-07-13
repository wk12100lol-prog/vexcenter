<?php
try {
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$userId = (int)($input['user_id'] ?? $segments[3] ?? 0);
if (!$userId) Response::error(400, 'User ID required');

$user = Database::fetch("SELECT id, role FROM users WHERE id = ?", [$userId]);
if (!$user) Response::error(404, 'User not found');
if ($user['role'] === 'admin') Response::error(403, 'Cannot delete admin');

$tables = ['reviews', 'game_downloads', 'game_installations', 'purchases', 'messages', 'friends', 'developer_applications', 'notifications', 'games'];
foreach ($tables as $t) {
    try {
        if ($t === 'messages') {
            Database::execute("DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?", [$userId, $userId]);
        } elseif ($t === 'friends') {
            Database::execute("DELETE FROM friends WHERE user_id = ? OR friend_id = ?", [$userId, $userId]);
        } else {
            $col = ($t === 'games' || $t === 'notifications') ? 'user_id' : 'user_id';
            Database::execute("DELETE FROM $t WHERE user_id = ?", [$userId]);
        }
    } catch (Exception $e) {
        // skip if table doesn't exist
    }
}
Database::execute("DELETE FROM users WHERE id = ?", [$userId]);

Response::success(['deleted' => true], 'User deleted');
} catch (Exception $e) {
    Response::error(500, 'User delete error: ' . $e->getMessage());
}
