<?php
$gameId = (int)($_GET['id'] ?? 0);
if (!$gameId) { http_response_code(400); exit; }

$row = Database::fetch("SELECT thumbnail_data, thumbnail_mime FROM games WHERE id = ?", [$gameId]);
if (!$row || !$row['thumbnail_data']) { http_response_code(404); exit; }

$mime = $row['thumbnail_mime'] ?? 'image/png';
header('Content-Type: ' . $mime);
header('Cache-Control: public, max-age=86400');
echo $row['thumbnail_data'];
