<?php
$user = Auth::requireAuth();

$games = Database::fetchAll(
    "SELECT g.id, g.title, g.thumbnail, g.price, g.rating
     FROM games g
     JOIN purchases p ON g.id = p.game_id
     WHERE p.user_id = ?
     ORDER BY p.created_at DESC",
    [$user['id']]
);

foreach ($games as &$game) {
    $game['price'] = (float)$game['price'];
    $game['rating'] = $game['rating'] ? (float)$game['rating'] : null;
}

Response::success(['games' => $games]);
