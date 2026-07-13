<?php
/**
 * Helper odpowiedzi JSON
 */

class Response {
    public static function json($data, int $status = 200): void {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success($data = null, string $message = 'OK'): void {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public static function error(int $status, string $message, $errors = null): void {
        $payload = ['success' => false, 'error' => $message];
        if ($errors !== null) $payload['errors'] = $errors;
        self::json($payload, $status);
    }

    public static function paginated(array $items, int $total, int $page, int $perPage): void {
        self::json([
            'success' => true,
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($total / $perPage),
        ]);
    }
}
