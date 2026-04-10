<?php
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    jsonResponse(['error' => 'Email and password are required'], 400);
}

$email = trim($data['email']);
$password = $data['password'];

if (empty($email) || empty($password)) {
    jsonResponse(['error' => 'Email and password are required'], 400);
}

// Get user by email
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    jsonResponse(['error' => 'Invalid email or password'], 401);
}

// Generate JWT token
$token = generateJWT(['user_id' => $user['id'], 'email' => $user['email']]);

jsonResponse([
    'success' => true,
    'message' => 'Login successful',
    'token' => $token,
    'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'company_name' => $user['company_name'],
        'company_logo' => $user['company_logo'],
        'company_address' => $user['company_address'],
        'company_phone' => $user['company_phone'],
        'company_email' => $user['company_email']
    ]
]);
