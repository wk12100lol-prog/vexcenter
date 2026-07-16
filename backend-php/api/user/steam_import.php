<?php
$user = Auth::requireAuth();
$input = json_decode(file_get_contents('php://input'), true);
$games = $input['games'] ?? [];

if (empty($games)) Response::error(400, 'No games provided');

$added = 0;
foreach ($games as $g) {
    $title = trim($g['title'] ?? '');
    $exe = trim($g['exe'] ?? '');
    $steamId = (int)($g['steam_id'] ?? 0);
    if (!$title) continue;

    // Check if game already exists
    $existing = Database::fetch("SELECT id FROM games WHERE title = ? AND user_id = ?", [$title, $user['id']]);
    if ($existing) continue;

    // Create as a custom game owned by user
    $gameId = Database::insert(
        "INSERT INTO games (user_id, title, description, price, category, status) VALUES (?, ?, ?, 0, 'custom', 'approved')",
        [$user['id'], $title, 'Imported from Steam (ID: ' . $steamId . ')']
    );

    // Add to purchases (library)
    Database::execute(
        "INSERT IGNORE INTO purchases (user_id, game_id) VALUES (?, ?)",
        [$user['id'], $gameId]
    );

    // Register installation
    if ($exe) {
        Database::execute(
            "INSERT IGNORE INTO game_installations (user_id, game_id, install_path, executable_path) VALUES (?, ?, ?, ?)",
            [$user['id'], $gameId, dirname($exe), $exe]
        );
    }

    $added++;
}

Response::success(['added' => $added], $added . ' games imported from Steam');