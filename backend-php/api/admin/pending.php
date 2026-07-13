<?php
$games = Database::fetchAll(
    "SELECT g.id, g.title, g.description, g.thumbnail, g.price, g.category, g.tags, g.rating, g.status, g.is_featured, g.game_file, g.download_count, g.created_at, g.updated_at, g.user_id,
            u.username as developer_name
     FROM games g
     JOIN users u ON g.user_id = u.id
     WHERE g.status = 'pending'
     ORDER BY g.created_at DESC"
);

Response::success(['games' => $games]);
