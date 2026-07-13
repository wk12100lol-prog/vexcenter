<?php
$games = Database::fetchAll(
    "SELECT g.*, u.username as developer_name
     FROM games g
     JOIN users u ON g.user_id = u.id
     WHERE g.status = 'pending'
     ORDER BY g.created_at DESC"
);

Response::success(['games' => $games]);
