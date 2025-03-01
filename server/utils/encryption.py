from cryptography.fernet import Fernet, InvalidToken
import os
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from config import Config

# Get encryption key from configuration
ENCRYPTION_KEY = Config.ENCRYPTION_KEY

# Ensure encryption key is available
if not ENCRYPTION_KEY:
    raise ValueError("Encryption key not found in configuration")

# Derive a key from the password
def get_encryption_key():
    try:
        password = ENCRYPTION_KEY.encode()
        # Use a more secure salt approach
        salt = b'static_salt_for_eve_app_security'  # Better fixed salt than derived from password
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))
        return key
    except Exception as e:
        raise ValueError(f"Failed to generate encryption key: {str(e)}")

# Initialize Fernet cipher with the key
try:
    cipher_suite = Fernet(get_encryption_key())
except Exception as e:
    raise RuntimeError(f"Failed to initialize encryption: {str(e)}")

def encrypt_message(message):
    """Encrypt a message"""
    try:
        if message is None:
            raise ValueError("Cannot encrypt None value")
            
        if not isinstance(message, str):
            message = str(message)
            
        encrypted_message = cipher_suite.encrypt(message.encode('utf-8'))
        return encrypted_message.decode('utf-8')
    except Exception as e:
        raise RuntimeError(f"Encryption failed: {str(e)}")

def decrypt_message(encrypted_message):
    """Decrypt a message"""
    try:
        if encrypted_message is None:
            raise ValueError("Cannot decrypt None value")
            
        if not isinstance(encrypted_message, str):
            encrypted_message = str(encrypted_message)
            
        decrypted_message = cipher_suite.decrypt(encrypted_message.encode('utf-8'))
        return decrypted_message.decode('utf-8')
    except InvalidToken:
        raise ValueError("Invalid token or corrupted encrypted data")
    except Exception as e:
        raise RuntimeError(f"Decryption failed: {str(e)}")