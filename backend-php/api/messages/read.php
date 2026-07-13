<?php
$user = Auth::requireAuth();
$input = json_decode(file_get_contents('php://input'), true);
$otherId = (int)($input['user_id'] ?? 0);
if (!$otherId) Response::error(400, 'User ID required');
Database::execute("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?", [$user['id'], $otherId]);
Response::success(null, 'Marked as read');
