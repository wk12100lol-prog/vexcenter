<?php
$user = Auth::requireAuth();

$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$price = max(0, (float)($_POST['price'] ?? 0));
$category = trim($_POST['category'] ?? '');
$tags = trim($_POST['tags'] ?? '');

if (!$title || !$description) Response::error(400, 'Title and description are required');

$thumbnailPath = null;
$filePath = null;

if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($_FILES['thumbnail']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) Response::error(400, 'Invalid thumbnail format');
    $thumbnailPath = 'uploads/games/' . uniqid('thumb_') . '.' . $ext;
    move_uploaded_file($_FILES['thumbnail']['tmp_name'], __DIR__ . '/../../' . $thumbnailPath);
}

if (isset($_FILES['game_file']) && $_FILES['game_file']['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($_FILES['game_file']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ALLOWED_EXTENSIONS)) Response::error(400, 'Invalid file format');
    if ($_FILES['game_file']['size'] > MAX_GAME_SIZE) Response::error(400, 'File too large (max 2GB)');
    $filePath = 'uploads/games/' . uniqid('game_') . '.' . $ext;
    move_uploaded_file($_FILES['game_file']['tmp_name'], __DIR__ . '/../../' . $filePath);
}

$gameId = Database::insert(
    "INSERT INTO games (user_id, title, description, price, category, tags, thumbnail, game_file, status, rating, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, NOW())",
    [$user['id'], $title, $description, $price, $category, $tags, $thumbnailPath, $filePath]
);

Response::success(['game_id' => $gameId], 'Game uploaded successfully. Pending admin review.');
