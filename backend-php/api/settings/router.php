<?php
$user = Auth::requireAuth();
if ($method === 'get') require __DIR__ . '/get.php';
elseif ($method === 'put') require __DIR__ . '/update.php';
else Response::error(405, 'Method not allowed');
