<?php
if ($method !== 'post') {
    Response::error(405, 'Method not allowed');
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$code = trim($input['code'] ?? '');
$password = $input['password'] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error(400, 'Nieprawidłowy adres email');
    exit;
}
if (!preg_match('/^\d{6}$/', $code)) {
    Response::error(400, 'Kod musi składać się z 6 cyfr');
    exit;
}
if (strlen($password) < 6) {
    Response::error(400, 'Hasło musi mieć co najmniej 6 znaków');
    exit;
}

$db = Database::getInstance();

// Znajdź ważny kod
$stmt = $db->prepare("SELECT id FROM password_resets WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW()");
$stmt->execute([$email, $code]);
$reset = $stmt->fetch();

if (!$reset) {
    Response::error(400, 'Nieprawidłowy lub wygasły kod resetowania');
    exit;
}

// Zaktualizuj hasło
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $db->prepare("UPDATE users SET password = ? WHERE email = ?");
$stmt->execute([$hash, $email]);

// Oznacz kod jako użyty
$db->prepare("UPDATE password_resets SET used = 1 WHERE id = ?")->execute([$reset['id']]);

Response::success(['message' => 'Hasło zostało zaktualizowane.']);
