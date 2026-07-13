<?php
$user = Auth::requireAuth();
$input = json_decode(file_get_contents('php://input'), true);
$installPath = trim($input['install_path'] ?? '');
$exePath = trim($input['executable_path'] ?? '');
$game = Database::fetch("SELECT id, title FROM games WHERE id = ? AND status = 'approved'", [$id]);
if (!$game) Response::error(404, 'Game not found');
$existing = Database::fetch("SELECT id FROM game_installations WHERE user_id = ? AND game_id = ?", [$user['id'], $id]);
if ($existing) {
    $updates = [];
    $params = [];
    if ($installPath) { $updates[] = 'install_path = ?'; $params[] = $installPath; }
    if ($exePath) { $updates[] = 'executable_path = ?'; $params[] = $exePath; }
    if ($updates) {
        $params[] = $existing['id'];
        Database::execute("UPDATE game_installations SET " . implode(', ', $updates) . " WHERE id = ?", $params);
    }
} else {
    if (!$installPath) Response::error(400, 'Install path required');
    Database::insert("INSERT INTO game_installations (user_id, game_id, install_path, executable_path) VALUES (?, ?, ?, ?)", [$user['id'], $id, $installPath, $exePath]);
}
Response::success(null, 'Game registered successfully');
