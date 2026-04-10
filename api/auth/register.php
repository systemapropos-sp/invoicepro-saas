<?php
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    jsonResponse(['error' => 'Name, email and password are required'], 400);
}

$name = trim($data['name']);
$email = trim($data['email']);
$password = $data['password'];
$company_name = isset($data['company_name']) ? trim($data['company_name']) : '';

if (empty($name) || empty($email) || empty($password)) {
    jsonResponse(['error' => 'All fields are required'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['error' => 'Invalid email format'], 400);
}

if (strlen($password) < 6) {
    jsonResponse(['error' => 'Password must be at least 6 characters'], 400);
}

// Check if email exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['error' => 'Email already registered'], 409);
}

// Hash password
$hashed_password = password_hash($password, PASSWORD_BCRYPT);

// Insert user
$stmt = $pdo->prepare("INSERT INTO users (name, email, password, company_name) VALUES (?, ?, ?, ?)");
try {
    $stmt->execute([$name, $email, $hashed_password, $company_name]);
    $user_id = $pdo->lastInsertId();
    
    // Generate JWT token
    $token = generateJWT(['user_id' => $user_id, 'email' => $email]);
    
    jsonResponse([
        'success' => true,
        'message' => 'User registered successfully',
        'token' => $token,
        'user' => [
            'id' => $user_id,
            'name' => $name,
            'email' => $email,
            'company_name' => $company_name
        ]
    ], 201);
} catch (PDOException $e) {
    jsonResponse(['error' => 'Registration failed', 'message' => $e->getMessage()], 500);
}
