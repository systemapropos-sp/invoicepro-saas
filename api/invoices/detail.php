<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$user_id = $user['user_id'];

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) {
    jsonResponse(['error' => 'Invoice ID is required'], 400);
}

// Get invoice with user verification
$stmt = $pdo->prepare("
    SELECT i.*, c.name as client_name, c.email as client_email, c.phone as client_phone,
           c.address as client_address, c.city as client_city, c.state as client_state,
           c.zip as client_zip, c.country as client_country
    FROM invoices i 
    JOIN clients c ON i.client_id = c.id 
    WHERE i.id = ? AND i.user_id = ?
");
$stmt->execute([$id, $user_id]);
$invoice = $stmt->fetch();

if (!$invoice) {
    jsonResponse(['error' => 'Invoice not found'], 404);
}

switch ($method) {
    case 'GET':
        // Get invoice items
        $stmt = $pdo->prepare("SELECT * FROM invoice_items WHERE invoice_id = ?");
        $stmt->execute([$id]);
        $items = $stmt->fetchAll();
        
        jsonResponse([
            'success' => true,
            'invoice' => array_merge($invoice, ['items' => $items])
        ]);
        break;
        
    case 'PUT':
        // Update invoice
        $data = json_decode(file_get_contents('php://input'), true);
        
        // If updating items, recalculate totals
        if (isset($data['items']) && is_array($data['items'])) {
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $amount = ($item['quantity'] ?? 1) * ($item['rate'] ?? 0);
                $subtotal += $amount;
            }
            
            $tax_rate = $data['tax_rate'] ?? $invoice['tax_rate'];
            $tax_amount = $subtotal * ($tax_rate / 100);
            
            $discount_type = $data['discount_type'] ?? $invoice['discount_type'];
            $discount_value = $data['discount_value'] ?? $invoice['discount_value'];
            $discount_amount = 0;
            
            if ($discount_type === 'percentage') {
                $discount_amount = $subtotal * ($discount_value / 100);
            } elseif ($discount_type === 'fixed') {
                $discount_amount = $discount_value;
            }
            
            $total = $subtotal + $tax_amount - $discount_amount;
            
            // Delete old items and insert new ones
            $stmt = $pdo->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
            $stmt->execute([$id]);
            
            $stmt = $pdo->prepare("
                INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            foreach ($data['items'] as $item) {
                $quantity = $item['quantity'] ?? 1;
                $rate = $item['rate'] ?? 0;
                $amount = $quantity * $rate;
                
                $stmt->execute([$id, $item['description'] ?? '', $quantity, $rate, $amount]);
            }
            
            // Update invoice totals
            $stmt = $pdo->prepare("
                UPDATE invoices 
                SET subtotal = ?, tax_rate = ?, tax_amount = ?, 
                    discount_type = ?, discount_value = ?, discount_amount = ?, total = ?,
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$subtotal, $tax_rate, $tax_amount, $discount_type, $discount_value, $discount_amount, $total, $id]);
        }
        
        // Update other fields
        $allowed_fields = ['client_id', 'issue_date', 'due_date', 'status', 'notes', 'terms'];
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
            $sql = "UPDATE invoices SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }
        
        // Get updated invoice
        $stmt = $pdo->prepare("
            SELECT i.*, c.name as client_name, c.email as client_email, c.phone as client_phone,
                   c.address as client_address, c.city as client_city, c.state as client_state,
                   c.zip as client_zip, c.country as client_country
            FROM invoices i 
            JOIN clients c ON i.client_id = c.id 
            WHERE i.id = ?
        ");
        $stmt->execute([$id]);
        $invoice = $stmt->fetch();
        
        $stmt = $pdo->prepare("SELECT * FROM invoice_items WHERE invoice_id = ?");
        $stmt->execute([$id]);
        $items = $stmt->fetchAll();
        
        jsonResponse([
            'success' => true,
            'invoice' => array_merge($invoice, ['items' => $items])
        ]);
        break;
        
    case 'DELETE':
        // Delete invoice
        $stmt = $pdo->prepare("DELETE FROM invoices WHERE id = ?");
        try {
            $stmt->execute([$id]);
            jsonResponse(['success' => true, 'message' => 'Invoice deleted successfully']);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Failed to delete invoice', 'message' => $e->getMessage()], 500);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
