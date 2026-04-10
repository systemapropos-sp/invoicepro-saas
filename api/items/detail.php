<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$user_id = $user['user_id'];

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) {
    jsonResponse(['error' => 'Item ID is required'], 400);
}

// Verify item belongs to user
$stmt = $pdo->prepare("SELECT * FROM items WHERE id = ? AND user_id = ?");
$stmt->execute([$id, $user_id]);
$item = $stmt->fetch();

if (!$item) {
    jsonResponse(['error' => 'Item not found'], 404);
}

switch ($method) {
    case 'GET':
        jsonResponse(['success' => true, 'item' => $item]);
        break;
        
    case 'PUT':
        // Update item
        $data = json_decode(file_get_contents('php://input'), true);
        
        $allowed_fields = ['name', 'description', 'rate'];
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
        $sql = "UPDATE items SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute($params);
            
            $stmt = $pdo->prepare("SELECT * FROM items WHERE id = ?");
            $stmt->execute([$id]);
            $item = $stmt->fetch();
            
            jsonResponse(['success' => true, 'item' => $item]);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Failed to update item', 'message' => $e->getMessage()], 500);
        }
        break;
        
    case 'DELETE':
        // Delete item
        $stmt = $pdo->prepare("DELETE FROM items WHERE id = ?");
        try {
            $stmt->execute([$id]);
            jsonResponse(['success' => true, 'message' => 'Item deleted successfully']);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Failed to delete item', 'message' => $e->getMessage()], 500);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
