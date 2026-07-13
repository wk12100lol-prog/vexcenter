<?php
$user = Auth::requireAuth();
$install = Database::fetch("SELECT * FROM game_installations WHERE user_id = ? AND game_id = ?", [$user['id'], $id]);
if (!$install || !$install['executable_path']) Response::error(400, 'Game not installed or no executable set');
Database::execute("UPDATE game_installations SET last_played_at = NOW() WHERE id = ?", [$install['id']]);
Response::success(['executable_path' => $install['executable_path']], 'Ready to launch');
