<?php
$user = Auth::requireAuth();

Database::execute(
    "CREATE TABLE IF NOT EXISTS messages (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      sender_id INT UNSIGNED NOT NULL,
      receiver_id INT UNSIGNED NOT NULL,
      content TEXT NOT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_messages_conversation (sender_id, receiver_id),
      INDEX idx_messages_read (receiver_id, is_read)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

$otherId = (int)($_GET['user_id'] ?? 0);
$limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
$before = (int)($_GET['before'] ?? 0);

$params = [$user['id'], $otherId, $otherId, $user['id']];
$sql = "SELECT m.*, u_s.username as sender_name, u_s.avatar as sender_avatar,
               u_r.username as receiver_name, u_r.avatar as receiver_avatar
        FROM messages m
        JOIN users u_s ON m.sender_id = u_s.id
        JOIN users u_r ON m.receiver_id = u_r.id
        WHERE ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))";

if ($before > 0) {
    $sql .= " AND m.id < ?";
    $params[] = $before;
}

$sql .= " ORDER BY m.id DESC LIMIT $limit";

$messages = Database::fetchAll($sql, $params);
$messages = array_reverse($messages);

foreach ($messages as &$m) {
    $m['is_mine'] = (int)$m['sender_id'] === $user['id'];
}

Response::success(['messages' => $messages]);
