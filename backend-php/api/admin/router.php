<?php
Auth::requireAdmin();

$action = $segments[3] ?? 'list';

switch ($id) {
    case 'games':
        if ($action === 'list' || !$segments[3]) require __DIR__ . '/pending.php';
        elseif ($action === 'approve') require __DIR__ . '/approve.php';
        elseif ($action === 'reject') require __DIR__ . '/reject.php';
        else Response::error(404, 'Endpoint not found');
        break;
    case 'developers':
        if (!$subresource && !$action) require __DIR__ . '/dev_applications.php';
        elseif ($action === 'approve') require __DIR__ . '/dev_approve.php';
        elseif ($action === 'reject') require __DIR__ . '/dev_reject.php';
        else Response::error(404, 'Endpoint not found');
        break;
    case 'users':
        require __DIR__ . '/users_list.php';
        break;
    case 'stats':
        require __DIR__ . '/stats.php';
        break;
    default:
        Response::error(404, 'Endpoint not found');
}
