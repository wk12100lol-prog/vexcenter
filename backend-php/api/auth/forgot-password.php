<?php
if ($method !== 'post') {
    Response::error(405, 'Method not allowed');
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error(400, 'Nieprawidłowy adres email');
    exit;
}

$db = Database::getInstance();

// Sprawdź czy konto istnieje
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if (!$stmt->fetch()) {
    // Nie mów czy email istnieje (bezpieczeństwo)
    Response::success(['message' => 'Jeśli konto istnieje, kod resetowania został wysłany.']);
    exit;
}

// Generuj 6-cyfrowy kod
$code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

// Usuń stare kody dla tego emaila
$db->prepare("DELETE FROM password_resets WHERE email = ?")->execute([$email]);

// Zapisz nowy kod (ważny 30 minut)
$stmt = $db->prepare("INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))");
$stmt->execute([$email, $code]);

// Próba wysłania emaila
$subject = '=?UTF-8?B?' . base64_encode('Kod resetowania hasła - VexCenter') . '?=';
$message = "Twój kod resetowania hasła to: $code\n\n"
         . "Kod jest ważny przez 30 minut.\n\n"
         . "Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.\n\n"
         . "-- VexCenter Team";
$headers = "From: noreply@vexcenter.pl\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n"
         . "MIME-Version: 1.0\r\n";
$mailSent = @mail($email, $subject, $message, $headers);

// Zawsze zwracaj sukces (bezpieczeństwo), ale w dev dodaj kod do response
$resp = ['message' => 'Jeśli konto istnieje, kod resetowania został wysłany.'];
if (!$mailSent) {
    // Dev fallback: zwróć kod w odpowiedzi
    $resp['dev_code'] = $code;
}
Response::success($resp);
