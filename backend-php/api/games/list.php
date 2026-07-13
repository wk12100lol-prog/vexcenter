<?php
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(50, max(1, (int)($_GET['limit'] ?? DEFAULT_PAGE_SIZE)));
$offset = ($page - 1) * $limit;
$sort = $_GET['sort'] ?? 'newest';
$featured = isset($_GET['featured']);
$category = $_GET['category'] ?? '';

$where = ["status = 'approved'"];
$params = [];

if ($featured) {
    $where[] = 'is_featured = 1';
}
if ($category) {
    $where[] = 'category = ?';
    $params[] = $category;
}

$whereClause = implode(' AND ', $where);

switch ($sort) {
    case 'rating':
        $order = 'rating DESC';
        break;
    case 'price_asc':
        $order = 'price ASC';
        break;
    case 'price_desc':
        $order = 'price DESC';
        break;
    case 'oldest':
        $order = 'created_at ASC';
        break;
    default:
        $order = 'created_at DESC';
}

$total = Database::fetch("SELECT COUNT(*) as cnt FROM games WHERE $whereClause", $params)['cnt'];
$games = Database::fetchAll(
    "SELECT g.id, g.title, g.description, g.thumbnail, g.price, g.rating, g.category, g.tags, g.created_at,
            u.username as developer_name
     FROM games g
     LEFT JOIN users u ON g.user_id = u.id
     WHERE $whereClause ORDER BY $order LIMIT $limit OFFSET $offset",
    $params
);

foreach ($games as &$game) {
    $game['price'] = (float)$game['price'];
    $game['rating'] = $game['rating'] ? (float)$game['rating'] : null;
    $game['tags'] = $game['tags'] ? explode(',', $game['tags']) : [];
}

Response::paginated($games, $total, $page, $limit);
