<?php
$user = Auth::requireAuth();
$input = json_decode(file_get_contents('php://input'), true);
$friendId = (int)($input['friend_id'] ?? 0);
$req = Database::fetch("SELECT id FROM friends WHERE user_id = ? AND friend_id = ? AND status = 'pending'", [$friendId, $user['id']]);
if (!$req) Response::error(404, 'No pending request');
Database::execute("UPDATE friends SET status = 'accepted' WHERE id = ?", [$req['id']]);
Database::insert("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')", [$user['id'], $friendId]);
Response::success(null, 'Friend request accepted');
