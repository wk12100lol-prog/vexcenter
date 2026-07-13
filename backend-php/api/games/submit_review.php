<?php
$user = Auth::requireAuth();
$input = json_decode(file_get_contents('php://input'), true);
$rating = (int)($input['rating'] ?? 0);
$content = trim($input['content'] ?? '');

if ($rating < 1 || $rating > 5) Response::error(400, 'Rating must be between 1 and 5');

$game = Database::fetch("SELECT id FROM games WHERE id = ? AND status = 'approved'", [$id]);
if (!$game) Response::error(404, 'Game not found');

$existing = Database::fetch("SELECT id FROM reviews WHERE user_id = ? AND game_id = ?", [$user['id'], $id]);
if ($existing) Response::error(409, 'You already reviewed this game');

Database::insert(
    "INSERT INTO reviews (user_id, game_id, rating, content) VALUES (?, ?, ?, ?)",
    [$user['id'], $id, $rating, $content ?: null]
);

// Update game rating
Database::execute(
    "UPDATE games g SET g.rating = (SELECT AVG(rating) FROM reviews WHERE game_id = ?) WHERE g.id = ?",
    [$id, $id]
);

Response::success(null, 'Review submitted');