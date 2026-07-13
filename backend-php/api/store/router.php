<?php
if ($id === 'purchase') {
    require __DIR__ . '/purchase.php';
} else {
    Response::error(404, 'Store endpoint not found');
}
