<?php
/**
 * Autoryzacja JWT (HMAC-SHA256)
 * Implementacja bez zewnętrznych bibliotek — działa na czystym PHP
 */

class Auth {
    public static function generateToken(array $payload): string {
        $header = self::base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRY;
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payloadEncoded", JWT_SECRET, true)
        );
        return "$header.$payloadEncoded.$signature";
    }

    public static function validateToken(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $signature] = $parts;

        $expectedSig = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
        );

        if (!hash_equals($expectedSig, $signature)) return null;

        $data = json_decode(self::base64UrlDecode($payload), true);
        if (!$data || !isset($data['exp']) || $data['exp'] < time()) return null;

        return $data;
    }

    public static function getUserFromToken(): ?array {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) return null;

        $payload = self::validateToken($matches[1]);
        if (!$payload || !isset($payload['user_id'])) return null;

        $user = Database::fetch("SELECT id, username, email, avatar, role FROM users WHERE id = ?", [$payload['user_id']]);
        return $user ?: null;
    }

    public static function requireAuth(): array {
        $user = self::getUserFromToken();
        if (!$user) Response::error(401, 'Unauthorized — invalid or expired token');
        return $user;
    }

    public static function requireAdmin(): array {
        $user = self::requireAuth();
        if ($user['role'] !== 'admin') Response::error(403, 'Forbidden — admin access required');
        return $user;
    }

    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
