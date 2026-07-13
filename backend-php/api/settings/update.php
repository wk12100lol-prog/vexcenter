<?php
$input = json_decode(file_get_contents('php://input'), true);
$allowed = ['display_name', 'bio', 'status_message', 'website'];
$updates = [];
$params = [];
foreach ($allowed as $field) {
    if (isset($input[$field])) {
        $updates[] = "$field = ?";
        $params[] = trim($input[$field]);
    }
}
if (empty($updates)) Response::error(400, 'No fields to update');
$params[] = $user['id'];
Database::execute("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?", $params);
Response::success(null, 'Settings updated');
