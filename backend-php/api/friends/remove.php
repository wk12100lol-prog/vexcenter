<?php
$user = Auth::requireAuth();
$input = json_decode(file_get_contents('php://input'), true);
$friendId = (int)($input['friend_id'] ?? 0);
Database::execute("DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)", [$user['id'], $friendId, $friendId, $user['id']]);
Response::success(null, 'Friend removed');
