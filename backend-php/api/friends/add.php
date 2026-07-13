<?php
$user = Auth::requireAuth();
$input = json_decode(file_get_contents('php://input'), true);
$friendId = (int)($input['friend_id'] ?? 0);
if (!$friendId || $friendId === $user['id']) Response::error(400, 'Invalid friend ID');
$friend = Database::fetch("SELECT id FROM users WHERE id = ?", [$friendId]);
if (!$friend) Response::error(404, 'User not found');
$existing = Database::fetch("SELECT id, status FROM friends WHERE user_id = ? AND friend_id = ?", [$user['id'], $friendId]);
if ($existing) Response::error(409, 'Friend request already ' . $existing['status']);
Database::insert("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'pending')", [$user['id'], $friendId]);
Response::success(null, 'Friend request sent');
