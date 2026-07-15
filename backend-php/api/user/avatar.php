<?php
$user = Auth::requireAuth();

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    Response::error(400, 'No avatar file uploaded');
}

$ext = strtolower(pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
    Response::error(400, 'Invalid avatar format. Allowed: jpg, png, webp, gif');
}

$data = file_get_contents($_FILES['avatar']['tmp_name']);
$mime = mime_content_type($_FILES['avatar']['tmp_name']);
$base64 = 'data:' . $mime . ';base64,' . base64_encode($data);

Database::execute("UPDATE users SET avatar = ? WHERE id = ?", [$base64, $user['id']]);

Response::success(['avatar' => $base64], 'Avatar updated');
