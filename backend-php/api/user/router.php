<?php
switch ($id) {
    case 'profile':
        if ($method === 'get') require __DIR__ . '/profile.php';
        elseif ($method === 'put') require __DIR__ . '/profile_update.php';
        else Response::error(405, 'Method not allowed');
        break;
    case 'library':
        require __DIR__ . '/library.php';
        break;
    default:
        Response::error(404, 'User endpoint not found');
}
