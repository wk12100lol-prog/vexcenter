<?php
if ($method === 'get') {
    $reviewId = $_GET['review_id'] ?? null;
    if (!$reviewId) Response::error(400, 'review_id required');
    $comments = Database::fetchAll(
        "SELECT rc.*, u.username, u.avatar FROM review_comments rc JOIN users u ON rc.user_id = u.id WHERE rc.review_id = ? ORDER BY rc.created_at ASC",
        [$reviewId]
    );
    Response::success(['comments' => $comments]);
} elseif ($method === 'post') {
    $user = Auth::requireAuth();
    $input = json_decode(file_get_contents('php://input'), true);
    $reviewId = $input['review_id'] ?? null;
    $content = trim($input['content'] ?? '');
    if (!$reviewId) Response::error(400, 'review_id required');
    if (!$content) Response::error(400, 'Comment content cannot be empty');
    $review = Database::fetch("SELECT id FROM reviews WHERE id = ?", [$reviewId]);
    if (!$review) Response::error(404, 'Review not found');
    Database::insert(
        "INSERT INTO review_comments (review_id, user_id, content) VALUES (?, ?, ?)",
        [$reviewId, $user['id'], $content]
    );
    Response::success(null, 'Comment added');
} else {
    Response::error(405, 'Method not allowed');
}