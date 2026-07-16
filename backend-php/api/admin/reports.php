<?php
Auth::requireAdmin();

// Auto-create reports table if missing
try {
    Database::query("SELECT 1 FROM reports LIMIT 1");
} catch (Exception $e) {
    Database::query("CREATE TABLE IF NOT EXISTS reports (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category ENUM('bug','feature','other') NOT NULL DEFAULT 'other',
        status ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
        admin_note TEXT DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_reports_status (status),
        INDEX idx_reports_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

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
    $report = Database::fetch("SELECT user_id, title FROM reports WHERE id = ?", [$reportId]);
    if ($report) {
        $statusLabels = ['open'=>'Otwarte','in_progress'=>'W trakcie','resolved'=>'Rozwiązane','closed'=>'Zamknięte'];
        $dbMsg = 'Status zgłoszenia "' . $report['title'] . '" zmieniony na ' . ($statusLabels[$newStatus]??$newStatus);
        if ($adminNote) $dbMsg .= '. Odpowiedź admina: ' . $adminNote;
        Database::insert("INSERT INTO notifications (user_id, type, message) VALUES (?, 'report_update', ?)", [$report['user_id'], $dbMsg]);
    }
    Response::success(null, 'Report updated');
} else {
    Response::error(405, 'Method not allowed');
}
