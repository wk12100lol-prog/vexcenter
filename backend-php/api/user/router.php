<?php
switch ($id) {
    case 'profile':
        if ($method === 'get') require __DIR__ . '/profile.php';
        elseif ($method === 'put') require __DIR__ . '/profile_update.php';
        else Response::error(405, 'Method not allowed');
        break;
    case 'search':
        if ($method === 'get') require __DIR__ . '/search.php';
        else Response::error(405, 'Method not allowed');
        break;
    case 'avatar':
        if ($method === 'post') require __DIR__ . '/avatar.php';
        else Response::error(405, 'Method not allowed');
        break;
    case 'library':
        require __DIR__ . '/library.php';
        break;
    case 'public-profile':
        if ($method === 'get') require __DIR__ . '/public-profile.php';
        else Response::error(405, 'Method not allowed');
        break;
    case 'public-profile-reviews':
        if ($method === 'get') require __DIR__ . '/public-profile-reviews.php';
        else Response::error(405, 'Method not allowed');
        break;
    default:
        Response::error(404, 'User endpoint not found');
}
