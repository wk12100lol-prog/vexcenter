<?php
$user = Auth::requireAuth();
$q = trim($_GET['q'] ?? '');
if (strlen($q) < 2) Response::error(400, 'Query must be at least 2 characters');
$users = Database::fetchAll(
    "SELECT id, username, avatar, role, status_message FROM users WHERE username LIKE ? AND id != ? LIMIT 20",
    ["%$q%", $user['id']]
);
Response::success(['users' => $users]);
