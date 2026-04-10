<?php
// Database configuration
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database credentials - using environment variables or defaults
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'invoicefly';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}

// JWT Secret
$jwt_secret = getenv('JWT_SECRET') ?: 'your-secret-key-change-in-production';

// Helper function to generate JWT token
function generateJWT($payload) {
    global $jwt_secret;
    
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    
    $payload['iat'] = time();
    $payload['exp'] = time() + (60 * 60 * 24); // 24 hours
    $payload = json_encode($payload);
    $payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', "$header.$payload", $jwt_secret, true);
    $signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return "$header.$payload.$signature";
}

// Helper function to verify JWT token
function verifyJWT($token) {
    global $jwt_secret;
    
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    
    $signature = hash_hmac('sha256', "$parts[0].$parts[1]", $jwt_secret, true);
    $signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    if (!hash_equals($signature, $parts[2])) return false;
    
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) return false;
    
    return $payload;
}

// Helper function to get authenticated user
function getAuthUser() {
    $headers = getallheaders();
    $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (!preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    return verifyJWT($token);
}

// Helper function to require authentication
function requireAuth() {
    $user = getAuthUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    return $user;
}

// Helper function to send JSON response
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Helper function to generate invoice number
function generateInvoiceNumber($pdo, $user_id) {
    $year = date('Y');
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM invoices WHERE user_id = ? AND YEAR(created_at) = ?");
    $stmt->execute([$user_id, $year]);
    $result = $stmt->fetch();
    $count = $result['count'] + 1;
    return "INV-{$year}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
}

// Helper function to generate estimate number
function generateEstimateNumber($pdo, $user_id) {
    $year = date('Y');
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM estimates WHERE user_id = ? AND YEAR(created_at) = ?");
    $stmt->execute([$user_id, $year]);
    $result = $stmt->fetch();
    $count = $result['count'] + 1;
    return "EST-{$year}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
}
