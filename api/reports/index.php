<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$user_id = $user['user_id'];

if ($method !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$report_type = isset($_GET['type']) ? $_GET['type'] : 'revenue';

switch ($report_type) {
    case 'revenue':
        // Revenue report by month
        $year = isset($_GET['year']) ? (int)$_GET['year'] : date('Y');
        
        $data = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
            
            // Paid invoices
            $stmt = $pdo->prepare("
                SELECT COALESCE(SUM(total), 0) as total 
                FROM invoices 
                WHERE user_id = ? AND status = 'paid' AND YEAR(created_at) = ? AND MONTH(created_at) = ?
            ");
            $stmt->execute([$user_id, $year, $month]);
            $paid = $stmt->fetch()['total'];
            
            // Pending invoices
            $stmt = $pdo->prepare("
                SELECT COALESCE(SUM(total), 0) as total 
                FROM invoices 
                WHERE user_id = ? AND status IN ('sent', 'viewed') AND YEAR(created_at) = ? AND MONTH(created_at) = ?
            ");
            $stmt->execute([$user_id, $year, $month]);
            $pending = $stmt->fetch()['total'];
            
            // Overdue invoices
            $stmt = $pdo->prepare("
                SELECT COALESCE(SUM(total), 0) as total 
                FROM invoices 
                WHERE user_id = ? AND status = 'overdue' AND YEAR(created_at) = ? AND MONTH(created_at) = ?
            ");
            $stmt->execute([$user_id, $year, $month]);
            $overdue = $stmt->fetch()['total'];
            
            $data[] = [
                'month' => date('M', mktime(0, 0, 0, $month, 1)),
                'paid' => (float)$paid,
                'pending' => (float)$pending,
                'overdue' => (float)$overdue
            ];
        }
        
        jsonResponse(['success' => true, 'data' => $data]);
        break;
        
    case 'invoice-status':
        // Invoice status distribution
        $stmt = $pdo->prepare("
            SELECT status, COUNT(*) as count, COALESCE(SUM(total), 0) as total
            FROM invoices 
            WHERE user_id = ? 
            GROUP BY status
        ");
        $stmt->execute([$user_id]);
        $data = $stmt->fetchAll();
        
        jsonResponse(['success' => true, 'data' => $data]);
        break;
        
    case 'top-clients':
        // Top clients by revenue
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        
        $stmt = $pdo->prepare("
            SELECT c.id, c.name, c.email, COUNT(i.id) as invoice_count, COALESCE(SUM(i.total), 0) as total_revenue
            FROM clients c
            LEFT JOIN invoices i ON c.id = i.client_id AND i.status = 'paid'
            WHERE c.user_id = ?
            GROUP BY c.id
            ORDER BY total_revenue DESC
            LIMIT ?
        ");
        $stmt->execute([$user_id, $limit]);
        $data = $stmt->fetchAll();
        
        jsonResponse(['success' => true, 'data' => $data]);
        break;
        
    case 'yearly-summary':
        // Yearly summary
        $year = isset($_GET['year']) ? (int)$_GET['year'] : date('Y');
        
        // Total invoices
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
            FROM invoices 
            WHERE user_id = ? AND YEAR(created_at) = ?
        ");
        $stmt->execute([$user_id, $year]);
        $invoices = $stmt->fetch();
        
        // Paid amount
        $stmt = $pdo->prepare("
            SELECT COALESCE(SUM(total), 0) as total
            FROM invoices 
            WHERE user_id = ? AND status = 'paid' AND YEAR(created_at) = ?
        ");
        $stmt->execute([$user_id, $year]);
        $paid = $stmt->fetch()['total'];
        
        // Total estimates
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
            FROM estimates 
            WHERE user_id = ? AND YEAR(created_at) = ?
        ");
        $stmt->execute([$user_id, $year]);
        $estimates = $stmt->fetch();
        
        // New clients
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count
            FROM clients 
            WHERE user_id = ? AND YEAR(created_at) = ?
        ");
        $stmt->execute([$user_id, $year]);
        $new_clients = $stmt->fetch()['count'];
        
        jsonResponse([
            'success' => true,
            'data' => [
                'invoices' => [
                    'count' => (int)$invoices['count'],
                    'total' => (float)$invoices['total']
                ],
                'paid_amount' => (float)$paid,
                'estimates' => [
                    'count' => (int)$estimates['count'],
                    'total' => (float)$estimates['total']
                ],
                'new_clients' => (int)$new_clients
            ]
        ]);
        break;
        
    default:
        jsonResponse(['error' => 'Invalid report type'], 400);
}
