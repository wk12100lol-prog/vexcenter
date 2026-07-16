<?php
// Auto-create reports table if missing
try {
    Database::query("SELECT 1 FROM reports LIMIT 1");
} catch (Exception $e) {
    Database::query("CREATE TABLE IF NOT EXISTS reports (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category ENUM('bug','feature','other') NOT NULL DEFAULT 'other',
        status ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
        admin_note TEXT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_reports_status (status),
        INDEX idx_reports_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

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
