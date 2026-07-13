<?php
if ($method !== 'put') Response::error(405, 'Method not allowed');
$appId = (int)($segments[2] ?? 0);
$app = Database::fetch("SELECT * FROM developer_applications WHERE id = ? AND status = 'pending'", [$appId]);
if (!$app) Response::error(404, 'Pending application not found');
Database::execute("UPDATE users SET role = 'developer' WHERE id = ?", [$app['user_id']]);
Database::execute("UPDATE developer_applications SET status = 'approved' WHERE id = ?", [$appId]);
Response::success(null, 'Developer approved');
