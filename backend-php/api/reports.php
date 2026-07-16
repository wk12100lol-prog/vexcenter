<?php
$user = Auth::requireAuth();

if ($method === 'post') {
    $input = json_decode(file_get_contents('php://input'), true);
    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $category = trim($input['category'] ?? 'other');
    if (!$title) Response::error(400, 'Title is required');
    if (!$description) Response::error(400, 'Description is required');
    if (!in_array($category, ['bug','feature','other'])) $category = 'other';
    Database::insert(
        "INSERT INTO reports (user_id, title, description, category) VALUES (?, ?, ?, ?)",
        [$user['id'], $title, $description, $category]
    );
    Response::success(null, 'Report submitted');
} elseif ($method === 'get') {
    $reports = Database::fetchAll(
        "SELECT id, title, description, category, status, admin_note, created_at, updated_at FROM reports WHERE user_id = ? ORDER BY created_at DESC",
        [$user['id']]
    );
    Response::success(['reports' => $reports]);
} else {
    Response::error(405, 'Method not allowed');
}
