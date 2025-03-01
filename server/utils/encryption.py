from cryptography.fernet import Fernet
import os
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from config import Config

# Get encryption key from configuration
ENCRYPTION_KEY = Config.ENCRYPTION_KEY

# Derive a key from the password
def get_encryption_key():
    password = ENCRYPTION_KEY.encode()
    salt = b'salt_' + password[:4]  # Simple salt derivation
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password))
    return key

# Initialize Fernet cipher with the key
cipher_suite = Fernet(get_encryption_key())

def encrypt_message(message):
    """Encrypt a message"""
    if not isinstance(message, str):
        message = str(message)
    encrypted_message = cipher_suite.encrypt(message.encode('utf-8'))
    return encrypted_message.decode('utf-8')

def decrypt_message(encrypted_message):
    """Decrypt a message"""
    if not isinstance(encrypted_message, str):
        encrypted_message = str(encrypted_message)
    decrypted_message = cipher_suite.decrypt(encrypted_message.encode('utf-8'))
    return decrypted_message.decode('utf-8')