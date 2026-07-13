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
    $inst = Database::fetch("SELECT id, install_path, executable_path FROM game_installations WHERE user_id = ? AND game_id = ?", [$user['id'], $game['id']]);
    $game['installed'] = !!$inst;
    $game['install_id'] = $inst ? (int)$inst['id'] : null;
    $game['executable_path'] = $inst ? $inst['executable_path'] : null;
}

Response::success(['games' => $games]);
