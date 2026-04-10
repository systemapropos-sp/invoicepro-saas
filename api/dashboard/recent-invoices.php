<?php
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$user = requireAuth();
$user_id = $user['user_id'];

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;

$stmt = $pdo->prepare("
    SELECT i.*, c.name as client_name, c.email as client_email 
    FROM invoices i 
    JOIN clients c ON i.client_id = c.id 
    WHERE i.user_id = ? 
    ORDER BY i.created_at DESC 
    LIMIT ?
");
$stmt->execute([$user_id, $limit]);
$invoices = $stmt->fetchAll();

jsonResponse([
    'success' => true,
    'invoices' => $invoices
]);
