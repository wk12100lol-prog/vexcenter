<?php
$stats = Database::fetch(
    "SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM games) as total_games,
        (SELECT COUNT(*) FROM games WHERE status = 'pending') as pending_games,
        (SELECT COUNT(*) FROM developer_applications WHERE status = 'pending') as pending_devs,
        (SELECT COUNT(*) FROM purchases) as total_purchases,
        (SELECT COUNT(*) FROM reviews) as total_reviews"
);
Response::success(['stats' => $stats]);
