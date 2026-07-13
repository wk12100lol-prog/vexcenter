<?php
if ($method !== 'put') Response::error(405, 'Method not allowed');

$gameId = (int)($segments[2] ?? 0);
$game = Database::fetch("SELECT id FROM games WHERE id = ? AND status = 'pending'", [$gameId]);
if (!$game) Response::error(404, 'Pending game not found');

Database::execute("UPDATE games SET status = 'approved' WHERE id = ?", [$gameId]);

Response::success(null, 'Game approved');
