<?php
$resource = 'announcements';

if ($method === 'get') {
    $announcements = Database::fetchAll("SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 10");
    Response::success(['announcements' => $announcements]);
} elseif ($method === 'post') {
    Auth::requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true);
    $title = trim($input['title'] ?? '');
    $content = trim($input['content'] ?? '');
    $type = $input['type'] ?? 'info';
    if (!$title || !$content) Response::error(400, 'Title and content required');
    Database::insert("INSERT INTO announcements (title, content, type) VALUES (?, ?, ?)", [$title, $content, $type]);
    Response::success(null, 'Announcement created');
} elseif ($method === 'delete' && $id) {
    Auth::requireAdmin();
    Database::execute("UPDATE announcements SET is_active = 0 WHERE id = ?", [$id]);
    Response::success(null, 'Announcement hidden');
} else {
    Response::error(405, 'Method not allowed');
}
