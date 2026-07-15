<?php
$user = Auth::requireAuth();

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    Response::error(400, 'No avatar file uploaded');
}

$ext = strtolower(pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
    Response::error(400, 'Invalid avatar format. Allowed: jpg, png, webp, gif');
}

// Limit file size to 2MB
if ($_FILES['avatar']['size'] > 2 * 1024 * 1024) {
    Response::error(400, 'Avatar file too large. Maximum 2MB.');
}

$mime = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'webp' => 'image/webp',
    'gif' => 'image/gif',
][$ext];

$data = file_get_contents($_FILES['avatar']['tmp_name']);
$base64 = 'data:' . $mime . ';base64,' . base64_encode($data);

// Ensure avatar column can hold base64 data
try {
    Database::execute("ALTER TABLE users MODIFY COLUMN avatar LONGTEXT DEFAULT NULL");
} catch (Exception $e) {
    // Column already altered or not needed
}

Database::execute("UPDATE users SET avatar = ? WHERE id = ?", [$base64, $user['id']]);

Response::success(['avatar' => $base64], 'Avatar updated');
