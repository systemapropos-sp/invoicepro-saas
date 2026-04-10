<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$user_id = $user['user_id'];

switch ($method) {
    case 'GET':
        // Get all invoices
        $status = isset($_GET['status']) ? $_GET['status'] : '';
        $client_id = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 0;
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT i.*, c.name as client_name, c.email as client_email 
                FROM invoices i 
                JOIN clients c ON i.client_id = c.id 
                WHERE i.user_id = ?";
        $params = [$user_id];
        
        if ($status) {
            $sql .= " AND i.status = ?";
            $params[] = $status;
        }
        
        if ($client_id) {
            $sql .= " AND i.client_id = ?";
            $params[] = $client_id;
        }
        
        if ($search) {
            $sql .= " AND (i.invoice_number LIKE ? OR c.name LIKE ?)";
            $searchParam = "%$search%";
            $params[] = $searchParam;
            $params[] = $searchParam;
        }
        
        $sql .= " ORDER BY i.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $invoices = $stmt->fetchAll();
        
        // Get total count
        $countSql = "SELECT COUNT(*) as count FROM invoices i JOIN clients c ON i.client_id = c.id WHERE i.user_id = ?";
        $countParams = [$user_id];
        
        if ($status) {
            $countSql .= " AND i.status = ?";
            $countParams[] = $status;
        }
        if ($client_id) {
            $countSql .= " AND i.client_id = ?";
            $countParams[] = $client_id;
        }
        if ($search) {
            $countSql .= " AND (i.invoice_number LIKE ? OR c.name LIKE ?)";
            $countParams[] = $searchParam;
            $countParams[] = $searchParam;
        }
        
        $stmt = $pdo->prepare($countSql);
        $stmt->execute($countParams);
        $total = $stmt->fetch()['count'];
        
        jsonResponse([
            'success' => true,
            'invoices' => $invoices,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        break;
        
    case 'POST':
        // Create new invoice
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['client_id'])) {
            jsonResponse(['error' => 'Client is required'], 400);
        }
        
        if (empty($data['items']) || !is_array($data['items'])) {
            jsonResponse(['error' => 'At least one item is required'], 400);
        }
        
        // Verify client belongs to user
        $stmt = $pdo->prepare("SELECT id FROM clients WHERE id = ? AND user_id = ?");
        $stmt->execute([$data['client_id'], $user_id]);
        if (!$stmt->fetch()) {
            jsonResponse(['error' => 'Invalid client'], 400);
        }
        
        // Calculate totals
        $subtotal = 0;
        foreach ($data['items'] as $item) {
            $amount = ($item['quantity'] ?? 1) * ($item['rate'] ?? 0);
            $subtotal += $amount;
        }
        
        $tax_rate = $data['tax_rate'] ?? 0;
        $tax_amount = $subtotal * ($tax_rate / 100);
        
        $discount_type = $data['discount_type'] ?? null;
        $discount_value = $data['discount_value'] ?? 0;
        $discount_amount = 0;
        
        if ($discount_type === 'percentage') {
            $discount_amount = $subtotal * ($discount_value / 100);
        } elseif ($discount_type === 'fixed') {
            $discount_amount = $discount_value;
        }
        
        $total = $subtotal + $tax_amount - $discount_amount;
        
        // Generate invoice number
        $invoice_number = generateInvoiceNumber($pdo, $user_id);
        
        // Insert invoice
        $stmt = $pdo->prepare("
            INSERT INTO invoices (user_id, client_id, invoice_number, issue_date, due_date, status,
                                subtotal, tax_rate, tax_amount, discount_type, discount_value, discount_amount, 
                                total, notes, terms) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        try {
            $stmt->execute([
                $user_id,
                $data['client_id'],
                $invoice_number,
                $data['issue_date'] ?? date('Y-m-d'),
                $data['due_date'] ?? date('Y-m-d', strtotime('+30 days')),
                $data['status'] ?? 'draft',
                $subtotal,
                $tax_rate,
                $tax_amount,
                $discount_type,
                $discount_value,
                $discount_amount,
                $total,
                $data['notes'] ?? '',
                $data['terms'] ?? ''
            ]);
            
            $invoice_id = $pdo->lastInsertId();
            
            // Insert items
            $stmt = $pdo->prepare("
                INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            foreach ($data['items'] as $item) {
                $quantity = $item['quantity'] ?? 1;
                $rate = $item['rate'] ?? 0;
                $amount = $quantity * $rate;
                
                $stmt->execute([
                    $invoice_id,
                    $item['description'] ?? '',
                    $quantity,
                    $rate,
                    $amount
                ]);
            }
            
            // Get full invoice with items
            $stmt = $pdo->prepare("
                SELECT i.*, c.name as client_name, c.email as client_email, c.phone as client_phone,
                       c.address as client_address, c.city as client_city, c.state as client_state,
                       c.zip as client_zip, c.country as client_country
                FROM invoices i 
                JOIN clients c ON i.client_id = c.id 
                WHERE i.id = ?
            ");
            $stmt->execute([$invoice_id]);
            $invoice = $stmt->fetch();
            
            $stmt = $pdo->prepare("SELECT * FROM invoice_items WHERE invoice_id = ?");
            $stmt->execute([$invoice_id]);
            $items = $stmt->fetchAll();
            
            jsonResponse([
                'success' => true, 
                'invoice' => array_merge($invoice, ['items' => $items])
            ], 201);
            
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Failed to create invoice', 'message' => $e->getMessage()], 500);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
