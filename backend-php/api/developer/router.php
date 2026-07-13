<?php
if ($id === 'apply') {
    require __DIR__ . '/apply.php';
} elseif ($id === 'status') {
    require __DIR__ . '/status.php';
} else {
    Response::error(404, 'Endpoint not found');
}
