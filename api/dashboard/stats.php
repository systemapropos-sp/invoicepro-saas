<?php
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$user = requireAuth();
$user_id = $user['user_id'];

// Get total invoices amount
$stmt = $pdo->prepare("SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE user_id = ?");
$stmt->execute([$user_id]);
$total_invoices = $stmt->fetch()['total'];

// Get paid amount
$stmt = $pdo->prepare("SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE user_id = ? AND status = 'paid'");
$stmt->execute([$user_id]);
$paid_amount = $stmt->fetch()['total'];

// Get pending amount (sent + viewed)
$stmt = $pdo->prepare("SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE user_id = ? AND status IN ('sent', 'viewed')");
$stmt->execute([$user_id]);
$pending_amount = $stmt->fetch()['total'];

// Get overdue amount
$stmt = $pdo->prepare("SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE user_id = ? AND status = 'overdue'");
$stmt->execute([$user_id]);
$overdue_amount = $stmt->fetch()['total'];

// Get invoice counts by status
$stmt = $pdo->prepare("SELECT status, COUNT(*) as count FROM invoices WHERE user_id = ? GROUP BY status");
$stmt->execute([$user_id]);
$status_counts = $stmt->fetchAll();

$invoice_counts = [
    'draft' => 0,
    'sent' => 0,
    'viewed' => 0,
    'paid' => 0,
    'overdue' => 0,
    'cancelled' => 0
];

foreach ($status_counts as $row) {
    $invoice_counts[$row['status']] = (int)$row['count'];
}

// Get total clients
$stmt = $pdo->prepare("SELECT COUNT(*) as count FROM clients WHERE user_id = ?");
$stmt->execute([$user_id]);
$total_clients = $stmt->fetch()['count'];

// Get total estimates
$stmt = $pdo->prepare("SELECT COUNT(*) as count FROM estimates WHERE user_id = ?");
$stmt->execute([$user_id]);
$total_estimates = $stmt->fetch()['count'];

jsonResponse([
    'success' => true,
    'stats' => [
        'total_invoices' => (float)$total_invoices,
        'paid_amount' => (float)$paid_amount,
        'pending_amount' => (float)$pending_amount,
        'overdue_amount' => (float)$overdue_amount,
        'invoice_counts' => $invoice_counts,
        'total_clients' => (int)$total_clients,
        'total_estimates' => (int)$total_estimates
    ]
]);
