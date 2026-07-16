<?php
Auth::requireAdmin();

if ($method === 'get') {
    $status = $_GET['status'] ?? '';
    if ($status) {
        $reports = Database::fetchAll(
            "SELECT r.*, u.username FROM reports r JOIN users u ON r.user_id = u.id WHERE r.status = ? ORDER BY r.created_at DESC",
            [$status]
        );
    } else {
        $reports = Database::fetchAll(
            "SELECT r.*, u.username FROM reports r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC"
        );
    }
    Response::success(['reports' => $reports]);
} elseif ($method === 'put') {
    $input = json_decode(file_get_contents('php://input'), true);
    $reportId = $input['id'] ?? null;
    $newStatus = $input['status'] ?? '';
    $adminNote = $input['admin_note'] ?? '';
    if (!$reportId) Response::error(400, 'Report ID required');
    if (!in_array($newStatus, ['open','in_progress','resolved','closed'])) Response::error(400, 'Invalid status');
    Database::execute(
        "UPDATE reports SET status = ?, admin_note = ? WHERE id = ?",
        [$newStatus, $adminNote, $reportId]
    );
    Response::success(null, 'Report updated');
} else {
    Response::error(405, 'Method not allowed');
}
