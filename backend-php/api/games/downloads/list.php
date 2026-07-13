<?php
$downloads = Database::fetchAll("SELECT * FROM game_downloads WHERE game_id = ? AND (SELECT status FROM games WHERE id = ?) = 'approved' ORDER BY created_at DESC", [$id, $id]);
Response::success(['downloads' => $downloads]);
