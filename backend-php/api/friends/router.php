<?php
switch ($method) {
    case 'get':
        if ($id === 'list') require __DIR__ . '/list.php';
        else Response::error(404, 'Endpoint not found');
        break;
    case 'post':
        if ($id === 'add') require __DIR__ . '/add.php';
        elseif ($id === 'accept') require __DIR__ . '/accept.php';
        elseif ($id === 'reject') require __DIR__ . '/reject.php';
        elseif ($id === 'remove') require __DIR__ . '/remove.php';
        else Response::error(404, 'Endpoint not found');
        break;
    default:
        Response::error(405, 'Method not allowed');
}
