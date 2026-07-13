<?php
$user = Auth::requireAuth();
$app = Database::fetch("SELECT * FROM developer_applications WHERE user_id = ?", [$user['id']]);
Response::success(['application' => $app, 'current_role' => $user['role']]);
