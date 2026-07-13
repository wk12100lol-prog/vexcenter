<?php
$user = Auth::requireAuth();

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    Response::error(400, 'No avatar file uploaded');
}

$ext = strtolower(pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
    Response::error(400, 'Invalid avatar format. Allowed: jpg, png, webp, gif');
}

$filename = 'avatars/' . $user['id'] . '_' . uniqid() . '.' . $ext;
$dest = __DIR__ . '/../../' . $filename;
move_uploaded_file($_FILES['avatar']['tmp_name'], $dest);

// Remove old avatar if it exists
if (!empty($user['avatar']) && file_exists(__DIR__ . '/../../' . $user['avatar'])) {
    @unlink(__DIR__ . '/../../' . $user['avatar']);
}

Database::execute("UPDATE users SET avatar = ? WHERE id = ?", [$filename, $user['id']]);

Response::success(['avatar' => $filename], 'Avatar updated');
