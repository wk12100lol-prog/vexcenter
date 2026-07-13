<?php
$user = Auth::requireAuth();
if ($method === 'get') {
    $notifs = Database::fetchAll("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", [$user['id']]);
    $unread = Database::fetch("SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0", [$user['id']])['cnt'];
    Response::success(['notifications' => $notifs, 'unread_count' => (int)$unread]);
} elseif ($method === 'put' && $id === 'read') {
    Database::execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [$user['id']]);
    Response::success(null, 'All marked as read');
} else {
    Response::error(405, 'Method not allowed');
}
