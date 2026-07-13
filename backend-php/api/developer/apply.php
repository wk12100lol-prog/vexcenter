<?php
if ($method !== 'post') Response::error(405, 'Method not allowed');
$user = Auth::requireAuth();
$input = json_decode(file_get_contents('php://input'), true);
$fullName = trim($input['full_name'] ?? '');
$studioName = trim($input['studio_name'] ?? '');
$website = trim($input['website'] ?? '');
$reason = trim($input['reason'] ?? '');
$experience = trim($input['experience'] ?? '');
if (!$fullName || !$reason) Response::error(400, 'Full name and reason are required');
$existing = Database::fetch("SELECT id, status FROM developer_applications WHERE user_id = ?", [$user['id']]);
if ($existing && $existing['status'] === 'pending') Response::error(409, 'Application already pending');
Database::insert(
    "INSERT INTO developer_applications (user_id, full_name, studio_name, website, reason, experience, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')",
    [$user['id'], $fullName, $studioName, $website, $reason, $experience]
);
Response::success(null, 'Application submitted for review');
