<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$user_id = $user['user_id'];

switch ($method) {
    case 'GET':
        // Get all saved items
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        
        $sql = "SELECT * FROM items WHERE user_id = ?";
        $params = [$user_id];
        
        if ($search) {
            $sql .= " AND (name LIKE ? OR description LIKE ?)";
            $searchParam = "%$search%";
            $params[] = $searchParam;
            $params[] = $searchParam;
        }
        
        $sql .= " ORDER BY name ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();
        
        jsonResponse([
            'success' => true,
            'items' => $items
        ]);
        break;
        
    case 'POST':
        // Create new item
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['name'])) {
            jsonResponse(['error' => 'Item name is required'], 400);
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO items (user_id, name, description, rate) 
            VALUES (?, ?, ?, ?)
        ");
        
        try {
            $stmt->execute([
                $user_id,
                $data['name'],
                $data['description'] ?? '',
                $data['rate'] ?? 0
            ]);
            
            $item_id = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM items WHERE id = ?");
            $stmt->execute([$item_id]);
            $item = $stmt->fetch();
            
            jsonResponse(['success' => true, 'item' => $item], 201);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Failed to create item', 'message' => $e->getMessage()], 500);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
