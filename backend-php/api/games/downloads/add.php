<?php
$user = Auth::requireAuth();
if ($user['role'] !== 'developer' && $user['role'] !== 'admin') Response::error(403, 'Only developers can add download links');
$game = Database::fetch("SELECT id, user_id FROM games WHERE id = ?", [$id]);
if (!$game) Response::error(404, 'Game not found');
if ($game['user_id'] !== $user['id'] && $user['role'] !== 'admin') Response::error(403, 'Not your game');
$input = json_decode(file_get_contents('php://input'), true);
$url = trim($input['url'] ?? '');
$platform = trim($input['platform'] ?? 'windows');
$version = trim($input['version'] ?? '1.0');
$filesize = (int)($input['filesize'] ?? 0);
if (!$url) Response::error(400, 'Download URL required');
Database::insert("INSERT INTO game_downloads (game_id, url, platform, version, filesize) VALUES (?, ?, ?, ?, ?)", [$id, $url, $platform, $version, $filesize]);
Response::success(null, 'Download link added');
