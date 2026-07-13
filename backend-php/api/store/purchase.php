<?php
if ($method !== 'post') Response::error(405, 'Method not allowed');

$user = Auth::requireAuth();
$input = json_decode(file_get_contents('php://input'), true);
$gameId = (int)($input['game_id'] ?? 0);

$game = Database::fetch("SELECT id, price FROM games WHERE id = ? AND status = 'approved'", [$gameId]);
if (!$game) Response::error(404, 'Game not found');

$existing = Database::fetch("SELECT id FROM purchases WHERE user_id = ? AND game_id = ?", [$user['id'], $gameId]);
if ($existing) Response::error(409, 'Game already in library');

Database::insert(
    "INSERT INTO purchases (user_id, game_id, price, created_at) VALUES (?, ?, ?, NOW())",
    [$user['id'], $gameId, $game['price']]
);

Response::success(null, 'Purchase successful');
