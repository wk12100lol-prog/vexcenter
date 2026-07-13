<?php
$user = Auth::requireAuth();
$game = Database::fetch("SELECT user_id FROM games WHERE id = ?", [$id]);
if (!$game) Response::error(404, 'Game not found');
if ($game['user_id'] !== $user['id'] && $user['role'] !== 'admin') Response::error(403, 'Forbidden');
$input = json_decode(file_get_contents('php://input'), true);
$downloadId = (int)($input['download_id'] ?? ($segments[4] ?? 0));
Database::execute("DELETE FROM game_downloads WHERE id = ? AND game_id = ?", [$downloadId, $id]);
Response::success(null, 'Download link removed');
