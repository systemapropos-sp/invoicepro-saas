<?php
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$user = requireAuth();
$user_id = $user['user_id'];

$months = 12;
$labels = [];
$data = [];

for ($i = $months - 1; $i >= 0; $i--) {
    $month = date('Y-m', strtotime("-$i months"));
    $labels[] = date('M Y', strtotime("-$i months"));
    
    $stmt = $pdo->prepare("
        SELECT COALESCE(SUM(total), 0) as total 
        FROM invoices 
        WHERE user_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ? AND status = 'paid'
    ");
    $stmt->execute([$user_id, $month]);
    $data[] = (float)$stmt->fetch()['total'];
}

jsonResponse([
    'success' => true,
    'chart' => [
        'labels' => $labels,
        'data' => $data
    ]
]);
