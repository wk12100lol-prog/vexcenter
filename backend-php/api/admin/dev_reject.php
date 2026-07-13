<?php
if ($method !== 'put') Response::error(405, 'Method not allowed');
$input = json_decode(file_get_contents('php://input'), true);
$appId = (int)($segments[2] ?? 0);
$note = trim($input['note'] ?? 'No reason provided');
$app = Database::fetch("SELECT id FROM developer_applications WHERE id = ? AND status = 'pending'", [$appId]);
if (!$app) Response::error(404, 'Pending application not found');
Database::execute("UPDATE developer_applications SET status = 'rejected', admin_note = ? WHERE id = ?", [$note, $appId]);
Response::success(null, 'Application rejected');
