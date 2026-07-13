<?php
switch ($method) {
    case 'get':
        if ($id === 'list') require __DIR__ . '/list.php';
        elseif ($id === 'conversations') require __DIR__ . '/conversations.php';
        else Response::error(404, 'Messages endpoint not found');
        break;
    case 'post':
        if ($id === 'send') require __DIR__ . '/send.php';
        else Response::error(404, 'Messages endpoint not found');
        break;
    case 'put':
        if ($id === 'read') require __DIR__ . '/read.php';
        else Response::error(404, 'Messages endpoint not found');
        break;
    default:
        Response::error(405, 'Method not allowed');
}
