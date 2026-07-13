<?php
try {
$user = Auth::requireAuth();

$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$price = max(0, (float)($_POST['price'] ?? 0));
$genre = trim($_POST['genre'] ?? trim($_POST['category'] ?? ''));
$downloadLink = trim($_POST['download_link'] ?? '');

if (!$title || !$description) Response::error(400, 'Title and description are required');

$thumbnailData = null;
$thumbnailMime = null;
$thumbnailPath = null;

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) Response::error(400, 'Invalid image format');
    $mimeMap = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];
    $thumbnailData = file_get_contents($_FILES['image']['tmp_name']);
    $thumbnailMime = $mimeMap[$ext] ?? 'image/png';
    $thumbnailPath = 'db:' . uniqid('thumb_') . '.' . $ext;
}

$gameId = Database::insert(
    "INSERT INTO games (user_id, title, description, price, category, thumbnail_data, thumbnail_mime, game_file, status, rating, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, NOW())",
    [$user['id'], $title, $description, $price, $genre, $thumbnailData, $thumbnailMime, $downloadLink ?: null]
);

if ($thumbnailData) {
    Database::execute("UPDATE games SET thumbnail = ? WHERE id = ?", ['db:' . $gameId, $gameId]);
}

Response::success(['game_id' => $gameId], 'Game uploaded successfully. Pending admin review.');
} catch (Exception $e) {
    Response::error(500, $e->getMessage());
}
