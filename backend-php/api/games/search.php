<?php
$query = trim($_GET['q'] ?? '');
if (!$query) Response::error(400, 'Search query is required');

$games = Database::fetchAll(
    "SELECT id, title, thumbnail, price, rating FROM games
     WHERE status = 'approved' AND (title LIKE ? OR description LIKE ?)
     ORDER BY rating DESC LIMIT 20",
    ["%$query%", "%$query%"]
);

foreach ($games as &$game) {
    $game['price'] = (float)$game['price'];
    $game['rating'] = $game['rating'] ? (float)$game['rating'] : null;
}

Response::success(['games' => $games]);
