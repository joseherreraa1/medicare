from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import logging

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
logger.debug("Intentando cargar variables de entorno...")
load_dotenv()

# Verificar si el archivo .env existe
env_path = os.path.join(os.path.dirname(__file__), '.env')
logger.debug(f"Ruta del archivo .env: {env_path}")
logger.debug(f"¿Existe el archivo .env? {os.path.exists(env_path)}")

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Esto permitirá solicitudes desde cualquier origen

# Configuración del correo
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
TO_EMAIL = os.getenv('TO_EMAIL')

# Verificar variables de entorno
logger.debug("=== Variables de entorno ===")
logger.debug(f"SMTP_SERVER: {SMTP_SERVER}")
logger.debug(f"SMTP_PORT: {SMTP_PORT}")
logger.debug(f"EMAIL_USER: {EMAIL_USER}")
logger.debug(f"EMAIL_PASSWORD: {'*' * len(EMAIL_PASSWORD) if EMAIL_PASSWORD else 'None'}")
logger.debug(f"TO_EMAIL: {TO_EMAIL}")
logger.debug("===========================")

# Ruta para servir el archivo index.html
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Ruta para servir archivos estáticos
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

def send_email(nombre, email, telefono, mensaje):
    try:
        # Verificar que tenemos todas las credenciales necesarias
        missing_vars = []
        if not EMAIL_USER:
            missing_vars.append("EMAIL_USER")
        if not EMAIL_PASSWORD:
            missing_vars.append("EMAIL_PASSWORD")
        if not TO_EMAIL:
            missing_vars.append("TO_EMAIL")
        
        if missing_vars:
            logger.error(f"Faltan las siguientes variables en el archivo .env: {', '.join(missing_vars)}")
            return False

        # Crear mensaje
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = TO_EMAIL
        msg['Subject'] = "Nueva consulta desde el sitio web"

        # Cuerpo del mensaje
        body = f"""
        Nueva consulta recibida:

        Nombre: {nombre}
        Email: {email}
        Teléfono: {telefono}
        Mensaje: {mensaje}
        """
        msg.attach(MIMEText(body, 'plain'))

        logger.debug("Intentando conectar al servidor SMTP...")
        # Iniciar conexión SMTP
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.set_debuglevel(1)  # Activar modo debug
        server.starttls()
        
        logger.debug("Intentando iniciar sesión...")
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        
        logger.debug("Enviando correo...")
        # Enviar correo
        text = msg.as_string()
        server.sendmail(EMAIL_USER, TO_EMAIL, text)
        server.quit()
        
        logger.debug("Correo enviado exitosamente")
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"Error de autenticación SMTP: {str(e)}")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"Error SMTP: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Error inesperado al enviar correo: {str(e)}")
        return False

@app.route('/send-email', methods=['POST'])
def handle_form():
    try:
        data = request.json
        logger.debug(f"Datos recibidos: {data}")
        
        # Validar datos requeridos
        if not all(k in data for k in ['nombre', 'email', 'mensaje']):
            logger.error("Faltan campos requeridos en el formulario")
            return jsonify({
                'success': False,
                'message': 'Por favor complete todos los campos requeridos'
            }), 400

        # Enviar correo
        if send_email(
            data['nombre'],
            data['email'],
            data.get('telefono', ''),
            data['mensaje']
        ):
            return jsonify({
                'success': True,
                'message': 'Mensaje enviado correctamente'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Error al enviar el mensaje. Por favor, verifica la configuración del servidor de correo.'
            }), 500

    except Exception as e:
        logger.error(f"Error en el servidor: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error en el servidor: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 