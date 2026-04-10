<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$user_id = $user['user_id'];

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) {
    jsonResponse(['error' => 'Client ID is required'], 400);
}

// Verify client belongs to user
$stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ? AND user_id = ?");
$stmt->execute([$id, $user_id]);
$client = $stmt->fetch();

if (!$client) {
    jsonResponse(['error' => 'Client not found'], 404);
}

switch ($method) {
    case 'GET':
        // Get client with invoice history
        $stmt = $pdo->prepare("
            SELECT c.*, 
                (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE client_id = c.id) as total_invoiced,
                (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE client_id = c.id AND status IN ('sent', 'viewed', 'overdue')) as balance
            FROM clients c 
            WHERE c.id = ?
        ");
        $stmt->execute([$id]);
        $client = $stmt->fetch();
        
        // Get recent invoices
        $stmt = $pdo->prepare("
            SELECT id, invoice_number, issue_date, due_date, status, total 
            FROM invoices 
            WHERE client_id = ? 
            ORDER BY created_at DESC 
            LIMIT 10
        ");
        $stmt->execute([$id]);
        $invoices = $stmt->fetchAll();
        
        jsonResponse([
            'success' => true,
            'client' => $client,
            'invoices' => $invoices
        ]);
        break;
        
    case 'PUT':
        // Update client
        $data = json_decode(file_get_contents('php://input'), true);
        
        $allowed_fields = ['name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country', 'notes'];
        $updates = [];
        $params = [];
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        
        if (empty($updates)) {
            jsonResponse(['error' => 'No fields to update'], 400);
        }
        
        $params[] = $id;
        $sql = "UPDATE clients SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute($params);
            
            $stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
            $stmt->execute([$id]);
            $client = $stmt->fetch();
            
            jsonResponse(['success' => true, 'client' => $client]);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Failed to update client', 'message' => $e->getMessage()], 500);
        }
        break;
        
    case 'DELETE':
        // Delete client
        $stmt = $pdo->prepare("DELETE FROM clients WHERE id = ?");
        try {
            $stmt->execute([$id]);
            jsonResponse(['success' => true, 'message' => 'Client deleted successfully']);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Failed to delete client', 'message' => $e->getMessage()], 500);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
