<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$user_id = $user['user_id'];

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) {
    jsonResponse(['error' => 'Estimate ID is required'], 400);
}

// Get estimate with user verification
$stmt = $pdo->prepare("
    SELECT e.*, c.name as client_name, c.email as client_email, c.phone as client_phone,
           c.address as client_address, c.city as client_city, c.state as client_state,
           c.zip as client_zip, c.country as client_country
    FROM estimates e 
    JOIN clients c ON e.client_id = c.id 
    WHERE e.id = ? AND e.user_id = ?
");
$stmt->execute([$id, $user_id]);
$estimate = $stmt->fetch();

if (!$estimate) {
    jsonResponse(['error' => 'Estimate not found'], 404);
}

switch ($method) {
    case 'GET':
        // Get estimate items
        $stmt = $pdo->prepare("SELECT * FROM estimate_items WHERE estimate_id = ?");
        $stmt->execute([$id]);
        $items = $stmt->fetchAll();
        
        jsonResponse([
            'success' => true,
            'estimate' => array_merge($estimate, ['items' => $items])
        ]);
        break;
        
    case 'PUT':
        // Update estimate
        $data = json_decode(file_get_contents('php://input'), true);
        
        // If updating items, recalculate totals
        if (isset($data['items']) && is_array($data['items'])) {
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $amount = ($item['quantity'] ?? 1) * ($item['rate'] ?? 0);
                $subtotal += $amount;
            }
            
            $tax_rate = $data['tax_rate'] ?? $estimate['tax_rate'];
            $tax_amount = $subtotal * ($tax_rate / 100);
            $discount_amount = $data['discount_amount'] ?? 0;
            $total = $subtotal + $tax_amount - $discount_amount;
            
            // Delete old items and insert new ones
            $stmt = $pdo->prepare("DELETE FROM estimate_items WHERE estimate_id = ?");
            $stmt->execute([$id]);
            
            $stmt = $pdo->prepare("
                INSERT INTO estimate_items (estimate_id, description, quantity, rate, amount) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            foreach ($data['items'] as $item) {
                $quantity = $item['quantity'] ?? 1;
                $rate = $item['rate'] ?? 0;
                $amount = $quantity * $rate;
                
                $stmt->execute([$id, $item['description'] ?? '', $quantity, $rate, $amount]);
            }
            
            // Update estimate totals
            $stmt = $pdo->prepare("
                UPDATE estimates 
                SET subtotal = ?, tax_rate = ?, tax_amount = ?, discount_amount = ?, total = ?,
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$subtotal, $tax_rate, $tax_amount, $discount_amount, $total, $id]);
        }
        
        // Update other fields
        $allowed_fields = ['client_id', 'issue_date', 'valid_until', 'status', 'notes'];
        $updates = [];
        $params = [];
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        
        if (!empty($updates)) {
            $params[] = $id;
            $sql = "UPDATE estimates SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }
        
        // Get updated estimate
        $stmt = $pdo->prepare("
            SELECT e.*, c.name as client_name, c.email as client_email 
            FROM estimates e 
            JOIN clients c ON e.client_id = c.id 
            WHERE e.id = ?
        ");
        $stmt->execute([$id]);
        $estimate = $stmt->fetch();
        
        $stmt = $pdo->prepare("SELECT * FROM estimate_items WHERE estimate_id = ?");
        $stmt->execute([$id]);
        $items = $stmt->fetchAll();
        
        jsonResponse([
            'success' => true,
            'estimate' => array_merge($estimate, ['items' => $items])
        ]);
        break;
        
    case 'DELETE':
        // Delete estimate
        $stmt = $pdo->prepare("DELETE FROM estimates WHERE id = ?");
        try {
            $stmt->execute([$id]);
            jsonResponse(['success' => true, 'message' => 'Estimate deleted successfully']);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Failed to delete estimate', 'message' => $e->getMessage()], 500);
        }
        break;
        
    case 'POST':
        // Convert estimate to invoice
        $action = isset($_GET['action']) ? $_GET['action'] : '';
        
        if ($action === 'convert') {
            // Get estimate items
            $stmt = $pdo->prepare("SELECT * FROM estimate_items WHERE estimate_id = ?");
            $stmt->execute([$id]);
            $items = $stmt->fetchAll();
            
            // Generate invoice number
            $invoice_number = generateInvoiceNumber($pdo, $user_id);
            
            // Create invoice from estimate
            $stmt = $pdo->prepare("
                INSERT INTO invoices (user_id, client_id, invoice_number, issue_date, due_date, status,
                                    subtotal, tax_rate, tax_amount, discount_type, discount_value, discount_amount, 
                                    total, notes, terms) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $user_id,
                $estimate['client_id'],
                $invoice_number,
                date('Y-m-d'),
                date('Y-m-d', strtotime('+30 days')),
                'draft',
                $estimate['subtotal'],
                $estimate['tax_rate'],
                $estimate['tax_amount'],
                null,
                0,
                $estimate['discount_amount'],
                $estimate['total'],
                $estimate['notes'],
                ''
            ]);
            
            $invoice_id = $pdo->lastInsertId();
            
            // Copy items
            $stmt = $pdo->prepare("
                INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            foreach ($items as $item) {
                $stmt->execute([
                    $invoice_id,
                    $item['description'],
                    $item['quantity'],
                    $item['rate'],
                    $item['amount']
                ]);
            }
            
            // Update estimate status
            $stmt = $pdo->prepare("UPDATE estimates SET status = 'converted' WHERE id = ?");
            $stmt->execute([$id]);
            
            // Get new invoice
            $stmt = $pdo->prepare("
                SELECT i.*, c.name as client_name, c.email as client_email 
                FROM invoices i 
                JOIN clients c ON i.client_id = c.id 
                WHERE i.id = ?
            ");
            $stmt->execute([$invoice_id]);
            $invoice = $stmt->fetch();
            
            jsonResponse([
                'success' => true,
                'message' => 'Estimate converted to invoice successfully',
                'invoice' => $invoice
            ]);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
