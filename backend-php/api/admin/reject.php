<?php
if ($method !== 'put') Response::error(405, 'Method not allowed');

$input = json_decode(file_get_contents('php://input'), true);
$gameId = (int)($segments[2] ?? 0);
$reason = trim($input['reason'] ?? 'No reason provided');

$game = Database::fetch("SELECT id FROM games WHERE id = ? AND status = 'pending'", [$gameId]);
if (!$game) Response::error(404, 'Pending game not found');

Database::execute("UPDATE games SET status = 'rejected' WHERE id = ?", [$gameId]);

Response::success(null, 'Game rejected: ' . $reason);
