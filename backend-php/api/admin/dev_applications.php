<?php
$apps = Database::fetchAll(
    "SELECT da.*, u.username, u.email FROM developer_applications da JOIN users u ON da.user_id = u.id ORDER BY da.created_at DESC"
);
Response::success(['applications' => $apps]);
