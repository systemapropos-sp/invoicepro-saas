<?php
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$user = requireAuth();

$stmt = $pdo->prepare("SELECT id, name, email, company_name, company_logo, company_address, company_phone, company_email, created_at FROM users WHERE id = ?");
$stmt->execute([$user['user_id']]);
$userData = $stmt->fetch();

if (!$userData) {
    jsonResponse(['error' => 'User not found'], 404);
}

jsonResponse([
    'success' => true,
    'user' => $userData
]);
