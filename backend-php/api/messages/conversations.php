<?php
$user = Auth::requireAuth();
$uid = $user['id'];

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

$conv = Database::fetchAll(
    "SELECT
       u.id as other_id, u.username as other_name, u.avatar as other_avatar,
       (SELECT m2.content FROM messages m2
        WHERE ((m2.sender_id = ? AND m2.receiver_id = u.id) OR (m2.sender_id = u.id AND m2.receiver_id = ?))
        ORDER BY m2.id DESC LIMIT 1
       ) as last_message,
       (SELECT m2.created_at FROM messages m2
        WHERE ((m2.sender_id = ? AND m2.receiver_id = u.id) OR (m2.sender_id = u.id AND m2.receiver_id = ?))
        ORDER BY m2.id DESC LIMIT 1
       ) as last_message_at,
       (SELECT COUNT(*) FROM messages WHERE receiver_id = ? AND sender_id = u.id AND is_read = 0) as unread
     FROM (
       SELECT DISTINCT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_id
       FROM messages WHERE sender_id = ? OR receiver_id = ?
     ) others
     JOIN users u ON u.id = others.other_id
     ORDER BY last_message_at DESC",
    [$uid, $uid, $uid, $uid, $uid, $uid, $uid, $uid]
);

Response::success(['conversations' => $conv]);
