<?php
$user = Auth::requireAuth();

$stats = Database::fetch(
    "SELECT
        (SELECT COUNT(*) FROM purchases WHERE user_id = ?) as gameCount,
        (SELECT COUNT(*) FROM reviews WHERE user_id = ?) as reviewCount,
        (SELECT COUNT(*) FROM friends WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted') as friendCount",
    [$user['id'], $user['id'], $user['id'], $user['id']]
);

Response::success([
    'user' => array_merge($user, [
        'gameCount' => (int)$stats['gameCount'],
        'reviewCount' => (int)$stats['reviewCount'],
        'friendCount' => (int)$stats['friendCount'],
    ]),
]);
