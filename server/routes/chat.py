import re
from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient
from utils.encryption import encrypt_message, decrypt_message
from utils.gemini import get_gemini_response
from routes.auth import token_required
from config import Config
import json

chat_bp = Blueprint('chat_bp', __name__)

# MongoDB setup
client = MongoClient(Config.MONGO_URI)
db = client['eve']
users_collection = db['users']
chats_collection = db['chats']

@chat_bp.route('/send', methods=['POST'])
@token_required
def send_message(current_user):
    data = request.get_json()
    if not data or not data.get('message'):
        return jsonify({'message': 'No message provided!'}), 400
    
    user_id = str(current_user['_id'])
    user_message = data['message']
    
    # Check for crisis keywords
    crisis_keywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'harm myself']
    is_crisis = any(keyword in user_message.lower() for keyword in crisis_keywords)
    
    if is_crisis:
        # Provide crisis response instead of using the API
        ai_response = """I'm deeply concerned about what you're sharing. Your life matters, and it's important you speak with someone immediately who can provide proper support. Please contact the National Suicide Prevention Lifeline at 988 or 1-800-273-8255, text HOME to 741741 to reach the Crisis Text Line, or go to your nearest emergency room. Would you like me to provide more resources that might help in this moment?"""
    else:
        # Encrypt user message
        encrypted_message = encrypt_message(user_message)
        
        # Get chat history for context
        chat_history = []
        chat = chats_collection.find_one({'user_id': ObjectId(user_id)})
        if chat and len(chat.get('messages', [])) > 0:
            messages = chat.get('messages', [])
            # Format the last few messages for Gemini
            for msg in messages[-10:]:
                role = "user" if msg['role'] == 'user' else "model"
                content = decrypt_message(msg['content'])
                chat_history.append({"role": role, "parts": [content]})
        
        # Generate response from Gemini
        ai_response = get_gemini_response(user_message, chat_history)
    
    # Encrypt the response
    encrypted_response = encrypt_message(ai_response)
    
    # Save to database
    timestamp = datetime.utcnow()
    
    # Check if chat exists for user
    if chat:
        # Append to existing chat
        chats_collection.update_one(
            {'user_id': ObjectId(user_id)},
            {'$push': {'messages': {
                '$each': [
                    {
                        'role': 'user',
                        'content': encrypted_message if not is_crisis else encrypt_message(user_message),
                        'timestamp': timestamp
                    },
                    {
                        'role': 'assistant',
                        'content': encrypted_response,
                        'timestamp': timestamp
                    }
                ]
            }}}
        )
    else:
        # Create new chat
        chat_entry = {
            'user_id': ObjectId(user_id),
            'messages': [
                {
                    'role': 'user',
                    'content': encrypted_message if not is_crisis else encrypt_message(user_message),
                    'timestamp': timestamp
                },
                {
                    'role': 'assistant',
                    'content': encrypted_response,
                    'timestamp': timestamp
                }
            ]
        }
        chats_collection.insert_one(chat_entry)
    
    return jsonify({
        'message': 'Message sent successfully!',
        'response': ai_response
    }), 200

@chat_bp.route('/initial', methods=['GET'])
@token_required
def get_initial_message(current_user):
    """Get an initial greeting message from Eve"""
    initial_message = "Hello, I'm Eve. I'm here to provide a space where you can explore your thoughts and feelings. What brings you here today? Perhaps you could share a bit about what's been on your mind recently."
    
    return jsonify({
        'message': 'Initial message retrieved successfully!',
        'response': initial_message
    }), 200

@chat_bp.route('/history', methods=['GET'])
@token_required
def get_chat_history(current_user):
    user_id = str(current_user['_id'])
    
    # Get chat history
    chat = chats_collection.find_one({'user_id': ObjectId(user_id)})
    if not chat:
        return jsonify({'messages': []}), 200
    
    # Decrypt messages
    decrypted_messages = []
    for message in chat['messages']:
        decrypted_messages.append({
            'role': message['role'],
            'content': decrypt_message(message['content']),
            'timestamp': message['timestamp'].isoformat()
        })
    
    return jsonify({'messages': decrypted_messages}), 200

@chat_bp.route('/voice', methods=['POST'])
@token_required
def process_voice(current_user):
    data = request.get_json()
    if not data or not data.get('text'):
        return jsonify({'message': 'No text provided!'}), 400
    
    user_id = str(current_user['_id'])
    user_message = data['text']
    
    # Check for crisis keywords
    crisis_keywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'harm myself']
    is_crisis = any(keyword in user_message.lower() for keyword in crisis_keywords)
    
    if is_crisis:
        # Provide crisis response instead of using the API
        ai_response = """I'm deeply concerned about what you're sharing. Your life matters, and it's important you speak with someone immediately who can provide proper support. Please contact the National Suicide Prevention Lifeline at 988 or 1-800-273-8255, text HOME to 741741 to reach the Crisis Text Line, or go to your nearest emergency room. Would you like me to provide more resources that might help in this moment?"""
    else:
        # Encrypt user message
        encrypted_message = encrypt_message(user_message)
        
        # Get chat history for context
        chat_history = []
        chat = chats_collection.find_one({'user_id': ObjectId(user_id)})
        if chat and len(chat.get('messages', [])) > 0:
            messages = chat.get('messages', [])
            # Format the last few messages for Gemini
            for msg in messages[-10:]:
                role = "user" if msg['role'] == 'user' else "model"
                content = decrypt_message(msg['content'])
                chat_history.append({"role": role, "parts": [content]})
        
        # Generate response from Gemini
        ai_response = get_gemini_response(user_message, chat_history)
    
    # Encrypt the response
    encrypted_response = encrypt_message(ai_response)
    
    # Save to database
    timestamp = datetime.utcnow()
    
    # Same database logic as the text message route
    if chat:
        chats_collection.update_one(
            {'user_id': ObjectId(user_id)},
            {'$push': {'messages': {
                '$each': [
                    {
                        'role': 'user',
                        'content': encrypted_message if not is_crisis else encrypt_message(user_message),
                        'timestamp': timestamp
                    },
                    {
                        'role': 'assistant',
                        'content': encrypted_response,
                        'timestamp': timestamp
                    }
                ]
            }}}
        )
    else:
        chat_entry = {
            'user_id': ObjectId(user_id),
            'messages': [
                {
                    'role': 'user',
                    'content': encrypted_message if not is_crisis else encrypt_message(user_message),
                    'timestamp': timestamp
                },
                {
                    'role': 'assistant',
                    'content': encrypted_response,
                    'timestamp': timestamp
                }
            ]
        }
        chats_collection.insert_one(chat_entry)
    
    return jsonify({
        'message': 'Voice message processed successfully!',
        'response': ai_response
    }), 200