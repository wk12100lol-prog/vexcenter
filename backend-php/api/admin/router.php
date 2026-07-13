<?php
Auth::requireAdmin();

$action = $segments[3] ?? 'list';

switch ($id) {
    case 'games':
        if ($subresource === 'delete') require __DIR__ . '/delete_game.php';
        elseif ($action === 'list' || !$segments[3]) require __DIR__ . '/pending.php';
        elseif ($action === 'approve') require __DIR__ . '/approve.php';
        elseif ($action === 'reject') require __DIR__ . '/reject.php';
        else Response::error(404, 'Endpoint not found');
        break;
    case 'developers':
        if ($action === 'list' || !$segments[3]) require __DIR__ . '/dev_applications.php';
        elseif ($action === 'approve') require __DIR__ . '/dev_approve.php';
        elseif ($action === 'reject') require __DIR__ . '/dev_reject.php';
        else Response::error(404, 'Endpoint not found');
        break;
    case 'users':
        if ($subresource === 'delete') require __DIR__ . '/delete_user.php';
        elseif ($subresource === 'role') require __DIR__ . '/set_role.php';
        else require __DIR__ . '/users_list.php';
        break;
    case 'stats':
        require __DIR__ . '/stats.php';
        break;
    default:
        Response::error(404, 'Endpoint not found');
}
