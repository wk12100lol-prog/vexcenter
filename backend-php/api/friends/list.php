<?php
$user = Auth::requireAuth();
$friends = Database::fetchAll(
    "SELECT DISTINCT u.id, u.username, u.avatar, u.status_message, u.role, f.status
     FROM friends f JOIN users u ON (CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END = u.id)
     WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'",
    [$user['id'], $user['id'], $user['id']]
);
$pending = Database::fetchAll(
    "SELECT u.id, u.username, u.avatar FROM friends f JOIN users u ON f.user_id = u.id WHERE f.friend_id = ? AND f.status = 'pending'",
    [$user['id']]
);
Response::success(['friends' => $friends, 'pending_requests' => $pending]);
