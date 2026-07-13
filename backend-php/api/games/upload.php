<?php
$user = Auth::requireAuth();

$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$price = max(0, (float)($_POST['price'] ?? 0));
$genre = trim($_POST['genre'] ?? trim($_POST['category'] ?? ''));
$downloadLink = trim($_POST['download_link'] ?? '');

if (!$title || !$description) Response::error(400, 'Title and description are required');

$thumbnailPath = null;

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) Response::error(400, 'Invalid image format');
    $thumbnailPath = 'uploads/games/' . uniqid('thumb_') . '.' . $ext;
    move_uploaded_file($_FILES['image']['tmp_name'], __DIR__ . '/../../' . $thumbnailPath);
}

$gameId = Database::insert(
    "INSERT INTO games (user_id, title, description, price, category, thumbnail, game_file, status, rating, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NULL, NOW())",
    [$user['id'], $title, $description, $price, $genre, $thumbnailPath, $downloadLink ?: null]
);

Response::success(['game_id' => $gameId], 'Game uploaded successfully. Pending admin review.');
