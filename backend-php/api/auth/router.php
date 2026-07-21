<?php
switch ($id) {
    case 'login':
        require __DIR__ . '/login.php';
        break;
    case 'register':
        require __DIR__ . '/register.php';
        break;
    case 'logout':
        require __DIR__ . '/logout.php';
        break;
    case 'forgot-password':
        require __DIR__ . '/forgot-password.php';
        break;
    case 'reset-password':
        require __DIR__ . '/reset-password.php';
        break;
    default:
        Response::error(404, 'Auth endpoint not found');
}
