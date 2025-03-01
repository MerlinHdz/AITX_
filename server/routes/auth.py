from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from pymongo import MongoClient
from bson import ObjectId
from config import Config

auth_bp = Blueprint('auth_bp', __name__)

# MongoDB setup
client = MongoClient(Config.MONGO_URI)
db = client['eve']
users_collection = db['users']

# JWT Secret
JWT_SECRET = Config.JWT_SECRET_KEY

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields!'}), 400
    
    # Check if user already exists
    if users_collection.find_one({'email': data['email']}):
        return jsonify({'message': 'User already exists!'}), 409
    
    # Create new user
    hashed_password = generate_password_hash(data['password'])
    new_user = {
        'email': data['email'],
        'password': hashed_password,
        'name': data.get('name', ''),
        'created_at': datetime.utcnow()
    }
    
    result = users_collection.insert_one(new_user)
    user_id = str(result.inserted_id)
    
    # Generate token
    token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, JWT_SECRET, algorithm="HS256")
    
    return jsonify({
        'message': 'User registered successfully!',
        'token': token,
        'user_id': user_id,
        'name': new_user['name']
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password!'}), 400
    
    user = users_collection.find_one({'email': data['email']})
    if not user:
        return jsonify({'message': 'User not found!'}), 404
    
    if check_password_hash(user['password'], data['password']):
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, JWT_SECRET, algorithm="HS256")
        
        return jsonify({
            'message': 'Login successful!',
            'token': token,
            'user_id': str(user['_id']),
            'name': user.get('name', '')
        }), 200
    
    return jsonify({'message': 'Invalid password!'}), 401

def token_required(f):
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = users_collection.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired!'}), 401
        except Exception:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    
    decorated.__name__ = f.__name__
    return decorated