<?php
$user = Auth::requireAuth();
$input = json_decode(file_get_contents('php://input'), true);
$receiverId = (int)($input['receiver_id'] ?? 0);
$content = trim($input['content'] ?? '');

if (!$receiverId || !$content) Response::error(400, 'Receiver ID and content are required');
if ($receiverId === $user['id']) Response::error(400, 'Cannot send message to yourself');

Database::execute(
    "CREATE TABLE IF NOT EXISTS messages (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      sender_id INT UNSIGNED NOT NULL,
      receiver_id INT UNSIGNED NOT NULL,
      content TEXT NOT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_messages_conversation (sender_id, receiver_id),
      INDEX idx_messages_read (receiver_id, is_read)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

$receiver = Database::fetch("SELECT id FROM users WHERE id = ?", [$receiverId]);
if (!$receiver) Response::error(404, 'User not found');

Database::insert(
    "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
    [$user['id'], $receiverId, $content]
);

Response::success(null, 'Message sent');
