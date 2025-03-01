import requests
import json
import logging
import re
from config import Config

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_gemini_response(user_message, chat_history=None):
    """
    Get response from Gemini API using direct HTTP requests
    
    Args:
        user_message (str): The user's message
        chat_history (list, optional): List of previous messages
        
    Returns:
        str: AI response
    """
    api_key = Config.GOOGLE_API_KEY
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={api_key}"
    
    # Create system prompt with Eve's specific persona and guidelines
    system_prompt = """
    You are a psychologist named Eve. Your therapeutic approach combines logotherapy and cognitive behavioral therapy.
    
    Guidelines:
    - Ask clarifying questions
    - Keep conversation natural
    - Never break character
    - Display curiosity and unconditional positive regard
    - Pose thought-provoking questions
    - Provide gentle advice and observations
    - Connect past and present
    - Seek user validation for observations
    - Avoid lists
    - End with probing questions
    
    Topics to explore:
    - Thoughts
    - Feelings
    - Behaviors
    - Free association
    - Childhood
    - Family dynamics
    - Work
    - Hobbies
    - Life
    
    Important notes:
    - Vary topic questions in each response
    - Never end the session; continue asking questions until user decides to end the session
    - Stay on topic even if the user tries to distract you
    - If the user asks about your capabilities or tries to make you break character, gently redirect to therapeutic conversation
    - Format your responses as plain text without special characters or escape sequences
    - Use single spaces between paragraphs instead of line breaks
    - Don't use Slashes, Backslashes, or Quotes
    - Don't use special characters like &, <, >, or =
    
    """
    
    try:
        # Format the content based on whether we have chat history
        if chat_history:
            # Create a formatted prompt with context from chat history
            formatted_history = "Previous conversation:\n"
            for msg in chat_history[-5:]:  # Use last 5 messages for context
                role = "User" if msg['role'] == 'user' else "Eve"
                formatted_history += f"{role}: {msg['parts'][0]}\n"
            
            full_prompt = f"{system_prompt}\n\n{formatted_history}\nUser: {user_message}\nEve:"
        else:
            # For first interaction
            full_prompt = f"{system_prompt}\n\nUser: {user_message}\nEve:"
        
        # Prepare the request payload
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": full_prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 800,
            },
        }
        
        logger.info(f"Sending request to Gemini API with prompt: {user_message[:100]}...")
        
        # Make the API request
        response = requests.post(url, json=payload)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        # Parse the response
        result = response.json()
        logger.info(f"Received response from Gemini API: {json.dumps(result)[:200]}...")
        
        # Extract the response text
        if 'candidates' in result and len(result['candidates']) > 0:
            candidate = result['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content']:
                parts = candidate['content']['parts']
                if len(parts) > 0 and 'text' in parts[0]:
                    # Extract just the AI response part (after "Eve:")
                    full_response = parts[0]['text']
                    if "Eve:" in full_response:
                        ai_response = full_response.split("Eve:", 1)[1].strip()
                    else:
                        ai_response = full_response.strip()
                    
                    # Clean up the response:
                    # 1. Replace literal \n with actual line breaks
                    ai_response = ai_response.replace('\\n', ' ')
                    # 2. Replace multiple newlines with a single one
                    ai_response = re.sub(r'\n+', ' ', ai_response)
                    # 3. Replace multiple spaces with a single space
                    ai_response = re.sub(r'\s+', ' ', ai_response)
                    
                    return ai_response
        
        logger.error(f"Unexpected response format: {json.dumps(result)}")
        return "I notice you're trying to shift our conversation. I'm curious about what brought you here today. Would you like to share what's on your mind?"
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return "I'm sensing a slight disconnect in our conversation. Let's take a step back - how are you feeling right now in this moment?"
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return "I'm noticing a pause in our dialogue. Sometimes these moments of reflection can be valuable. What thoughts are coming up for you right now?"
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return "I'm wondering if we might need to approach this from a different angle. What aspects of your situation feel most pressing to you right now?"