<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$user_id = $user['user_id'];

switch ($method) {
    case 'GET':
        // Get all clients
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT c.*, 
                (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE client_id = c.id) as total_invoiced,
                (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE client_id = c.id AND status IN ('sent', 'viewed', 'overdue')) as balance
                FROM clients c WHERE c.user_id = ?";
        $params = [$user_id];
        
        if ($search) {
            $sql .= " AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)";
            $searchParam = "%$search%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
        }
        
        $sql .= " ORDER BY c.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $clients = $stmt->fetchAll();
        
        // Get total count
        $countSql = "SELECT COUNT(*) as count FROM clients WHERE user_id = ?";
        $countParams = [$user_id];
        if ($search) {
            $countSql .= " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)";
            $countParams[] = $searchParam;
            $countParams[] = $searchParam;
            $countParams[] = $searchParam;
        }
        $stmt = $pdo->prepare($countSql);
        $stmt->execute($countParams);
        $total = $stmt->fetch()['count'];
        
        jsonResponse([
            'success' => true,
            'clients' => $clients,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        break;
        
    case 'POST':
        // Create new client
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['name'])) {
            jsonResponse(['error' => 'Client name is required'], 400);
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO clients (user_id, name, email, phone, address, city, state, zip, country, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        try {
            $stmt->execute([
                $user_id,
                $data['name'],
                $data['email'] ?? '',
                $data['phone'] ?? '',
                $data['address'] ?? '',
                $data['city'] ?? '',
                $data['state'] ?? '',
                $data['zip'] ?? '',
                $data['country'] ?? '',
                $data['notes'] ?? ''
            ]);
            
            $client_id = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
            $stmt->execute([$client_id]);
            $client = $stmt->fetch();
            
            jsonResponse(['success' => true, 'client' => $client], 201);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Failed to create client', 'message' => $e->getMessage()], 500);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
