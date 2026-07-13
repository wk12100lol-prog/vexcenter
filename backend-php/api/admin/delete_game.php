<?php
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? [];
$gameId = (int)($input['game_id'] ?? $segments[3] ?? 0);
if (!$gameId) Response::error(400, 'Game ID required. Raw: ' . ($rawInput ?: 'empty'));

$game = Database::fetch("SELECT id FROM games WHERE id = ?", [$gameId]);
if (!$game) Response::error(404, 'Game not found');

Database::execute("DELETE FROM reviews WHERE game_id = ?", [$gameId]);
Database::execute("DELETE FROM game_downloads WHERE game_id = ?", [$gameId]);
Database::execute("DELETE FROM game_screenshots WHERE game_id = ?", [$gameId]);
Database::execute("DELETE FROM game_installations WHERE game_id = ?", [$gameId]);
Database::execute("DELETE FROM purchases WHERE game_id = ?", [$gameId]);
Database::execute("DELETE FROM games WHERE id = ?", [$gameId]);

Response::success(['deleted' => true], 'Game deleted');
