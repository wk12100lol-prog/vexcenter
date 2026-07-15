<?php
$userId = $_GET['user_id'] ?? null;
if (!$userId) Response::error(400, 'user_id required');

$reviews = Database::fetchAll(
    "SELECT r.*, g.title as game_title FROM reviews r JOIN games g ON r.game_id = g.id WHERE r.user_id = ? ORDER BY r.created_at DESC LIMIT 20",
    [$userId]
);

Response::success(['reviews' => $reviews]);