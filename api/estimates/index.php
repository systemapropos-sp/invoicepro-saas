<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$user_id = $user['user_id'];

switch ($method) {
    case 'GET':
        // Get all estimates
        $status = isset($_GET['status']) ? $_GET['status'] : '';
        $client_id = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 0;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT e.*, c.name as client_name, c.email as client_email 
                FROM estimates e 
                JOIN clients c ON e.client_id = c.id 
                WHERE e.user_id = ?";
        $params = [$user_id];
        
        if ($status) {
            $sql .= " AND e.status = ?";
            $params[] = $status;
        }
        
        if ($client_id) {
            $sql .= " AND e.client_id = ?";
            $params[] = $client_id;
        }
        
        $sql .= " ORDER BY e.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $estimates = $stmt->fetchAll();
        
        // Get total count
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM estimates WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $total = $stmt->fetch()['count'];
        
        jsonResponse([
            'success' => true,
            'estimates' => $estimates,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        break;
        
    case 'POST':
        // Create new estimate
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['client_id'])) {
            jsonResponse(['error' => 'Client is required'], 400);
        }
        
        if (empty($data['items']) || !is_array($data['items'])) {
            jsonResponse(['error' => 'At least one item is required'], 400);
        }
        
        // Calculate totals
        $subtotal = 0;
        foreach ($data['items'] as $item) {
            $amount = ($item['quantity'] ?? 1) * ($item['rate'] ?? 0);
            $subtotal += $amount;
        }
        
        $tax_rate = $data['tax_rate'] ?? 0;
        $tax_amount = $subtotal * ($tax_rate / 100);
        $discount_amount = $data['discount_amount'] ?? 0;
        $total = $subtotal + $tax_amount - $discount_amount;
        
        // Generate estimate number
        $estimate_number = generateEstimateNumber($pdo, $user_id);
        
        // Insert estimate
        $stmt = $pdo->prepare("
            INSERT INTO estimates (user_id, client_id, estimate_number, issue_date, valid_until, status,
                                 subtotal, tax_rate, tax_amount, discount_amount, total, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        try {
            $stmt->execute([
                $user_id,
                $data['client_id'],
                $estimate_number,
                $data['issue_date'] ?? date('Y-m-d'),
                $data['valid_until'] ?? date('Y-m-d', strtotime('+30 days')),
                $data['status'] ?? 'draft',
                $subtotal,
                $tax_rate,
                $tax_amount,
                $discount_amount,
                $total,
                $data['notes'] ?? ''
            ]);
            
            $estimate_id = $pdo->lastInsertId();
            
            // Insert items
            $stmt = $pdo->prepare("
                INSERT INTO estimate_items (estimate_id, description, quantity, rate, amount) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            foreach ($data['items'] as $item) {
                $quantity = $item['quantity'] ?? 1;
                $rate = $item['rate'] ?? 0;
                $amount = $quantity * $rate;
                
                $stmt->execute([
                    $estimate_id,
                    $item['description'] ?? '',
                    $quantity,
                    $rate,
                    $amount
                ]);
            }
            
            // Get full estimate with items
            $stmt = $pdo->prepare("
                SELECT e.*, c.name as client_name, c.email as client_email 
                FROM estimates e 
                JOIN clients c ON e.client_id = c.id 
                WHERE e.id = ?
            ");
            $stmt->execute([$estimate_id]);
            $estimate = $stmt->fetch();
            
            $stmt = $pdo->prepare("SELECT * FROM estimate_items WHERE estimate_id = ?");
            $stmt->execute([$estimate_id]);
            $items = $stmt->fetchAll();
            
            jsonResponse([
                'success' => true, 
                'estimate' => array_merge($estimate, ['items' => $items])
            ], 201);
            
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Failed to create estimate', 'message' => $e->getMessage()], 500);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
