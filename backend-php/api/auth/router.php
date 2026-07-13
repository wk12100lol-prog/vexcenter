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
    default:
        Response::error(404, 'Auth endpoint not found');
}
