<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

header('Content-Type: application/json');

// Obtener datos del formulario
$data = json_decode(file_get_contents('php://input'), true);

// Validar datos requeridos
if (!isset($data['nombre']) || !isset($data['email']) || !isset($data['telefono']) || 
    !isset($data['especialidad']) || !isset($data['fecha']) || !isset($data['hora'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan campos requeridos']);
    exit;
}

// Configuración de PHPMailer
$mail = new PHPMailer(true);

try {
    // Configuración del servidor
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'tu-correo@gmail.com'; // Tu correo Gmail
    $mail->Password = 'tu-contraseña-de-aplicación'; // Tu contraseña de aplicación
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';

    // Remitente y destinatario
    $mail->setFrom($data['email'], $data['nombre']);
    $mail->addAddress('info@medicare.com', 'MediCare');

    // Contenido del correo
    $mail->isHTML(true);
    $mail->Subject = 'Nueva cita médica solicitada';
    
    $message = "<h2>Nueva solicitud de cita:</h2>";
    $message .= "<p><strong>Nombre:</strong> " . htmlspecialchars($data['nombre']) . "</p>";
    $message .= "<p><strong>Email:</strong> " . htmlspecialchars($data['email']) . "</p>";
    $message .= "<p><strong>Teléfono:</strong> " . htmlspecialchars($data['telefono']) . "</p>";
    $message .= "<p><strong>Especialidad:</strong> " . htmlspecialchars($data['especialidad']) . "</p>";
    $message .= "<p><strong>Fecha:</strong> " . htmlspecialchars($data['fecha']) . "</p>";
    $message .= "<p><strong>Hora:</strong> " . htmlspecialchars($data['hora']) . "</p>";
    if (isset($data['mensaje'])) {
        $message .= "<p><strong>Mensaje:</strong> " . htmlspecialchars($data['mensaje']) . "</p>";
    }
    
    $mail->Body = $message;
    $mail->AltBody = strip_tags($message);

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Cita agendada exitosamente']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al enviar el correo: ' . $mail->ErrorInfo]);
}
?> 