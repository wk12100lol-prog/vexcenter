<?php
if ($method === 'get' && $id === 'search') {
    require __DIR__ . '/search.php';
} elseif ($method === 'get' && !$id) {
    require __DIR__ . '/list.php';
} elseif ($method === 'get' && $id && !$subresource) {
    require __DIR__ . '/get.php';
} elseif ($method === 'post' && !$id) {
    require __DIR__ . '/upload.php';
    require __DIR__ . '/search.php';
} elseif ($id && $subresource === 'downloads' && $method === 'get') {
    require __DIR__ . '/downloads/list.php';
} elseif ($id && $subresource === 'downloads' && $method === 'post') {
    require __DIR__ . '/downloads/add.php';
} elseif ($id && $subresource === 'downloads' && $method === 'delete') {
    require __DIR__ . '/downloads/delete.php';
} elseif ($id && $subresource === 'install') {
    require __DIR__ . '/install.php';
} elseif ($id && $subresource === 'launch') {
    require __DIR__ . '/launch.php';
} elseif ($id && $subresource === 'play') {
    require __DIR__ . '/play.php';
} elseif ($id && $subresource === 'reviews' && $method === 'post') {
    require __DIR__ . '/submit_review.php';
} else {
    Response::error(404, 'Games endpoint not found');
}
