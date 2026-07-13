<?php
$users = Database::fetchAll("SELECT id, username, email, role, created_at FROM users ORDER BY id DESC");
Response::success(['users' => $users]);
