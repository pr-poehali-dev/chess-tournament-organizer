import json
import os
import psycopg2
import hashlib
import secrets
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для регистрации и авторизации пользователей с хэшированием паролей
    Поддерживает регистрацию, вход, выход, проверку сессии
    """
    
    method = event.get('httpMethod', 'GET')
    
    # CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    conn = None
    cursor = None
    
    try:
        # Подключение к БД
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()
        
        body_data = {}
        if event.get('body'):
            body_data = json.loads(event.get('body', '{}'))
        
        action = body_data.get('action', '')
        headers = event.get('headers', {})
        session_token = headers.get('X-Session-Token') or headers.get('x-session-token')
        
        if method == 'POST':
            if action == 'login':
                # Вход пользователя
                username = body_data.get('username')
                password = body_data.get('password')
                
                print(f"Login attempt: username={username}, password length={len(password) if password else 0}")
                print(f"Body data: {body_data}")
                
                if not username or not password:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Логин и пароль обязательны'})
                    }
                
                # Ищем пользователя по username
                cursor.execute("""
                    SELECT id, username, email, password_hash, full_name, user_type, birth_date, 
                           fsr_id, coach, educational_institution, role
                    FROM users 
                    WHERE username = %s AND is_active = true
                """, (username.lower(),))
                
                user = cursor.fetchone()
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Неверный логин или пароль'})
                    }
                
                # Проверяем пароль через хэш SHA-256
                password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
                if user[3] != password_hash:
                    return {
                        'statusCode': 401,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Неверный логин или пароль'})
                    }
                
                # Создаем сессию
                session_token = secrets.token_urlsafe(32)
                expires_at = datetime.now() + timedelta(hours=24)
                
                cursor.execute("""
                    INSERT INTO user_sessions (user_id, session_token, expires_at)
                    VALUES (%s, %s, %s)
                """, (user[0], session_token, expires_at))
                
                # Обновляем last_login
                cursor.execute("""
                    UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s
                """, (user[0],))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'sessionToken': session_token,
                        'expiresAt': expires_at.isoformat(),
                        'user': {
                            'id': user[0],
                            'username': user[1],
                            'email': user[2],
                            'fullName': user[4],
                            'userType': user[10] if user[10] else user[5],  # role или user_type
                            'birthDate': user[6].isoformat() if user[6] else None,
                            'fsrId': user[7],
                            'coach': user[8],
                            'educationalInstitution': user[9],
                            'role': user[10] if user[10] else 'player'
                        }
                    })
                }
            
            elif action == 'logout':
                # Выход пользователя
                if session_token:
                    cursor.execute("""
                        DELETE FROM user_sessions WHERE session_token = %s
                    """, (session_token,))
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'register':
                # Регистрация нового пользователя
                username = body_data.get('username')
                email = body_data.get('email') 
                password = body_data.get('password')
                full_name = body_data.get('fullName')
                
                if not username or not email or not password or not full_name:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Все обязательные поля должны быть заполнены'})
                    }
                
                # Проверяем уникальность username и email
                cursor.execute("""
                    SELECT id FROM users WHERE username = %s OR email = %s
                """, (username.lower(), email.lower()))
                
                if cursor.fetchone():
                    return {
                        'statusCode': 409,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Пользователь с таким логином или email уже существует'})
                    }
                
                # Хэшируем пароль
                password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
                
                # Создаём пользователя
                cursor.execute("""
                    INSERT INTO users (username, email, password_hash, full_name, user_type, role)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id, username, email, full_name, user_type, role
                """, (username.lower(), email.lower(), password_hash, full_name, 'player', 'player'))
                
                new_user = cursor.fetchone()
                conn.commit()
                
                # Создаем сессию
                session_token = secrets.token_urlsafe(32)
                expires_at = datetime.now() + timedelta(hours=24)
                
                cursor.execute("""
                    INSERT INTO user_sessions (user_id, session_token, expires_at)
                    VALUES (%s, %s, %s)
                """, (new_user[0], session_token, expires_at))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'sessionToken': session_token,
                        'expiresAt': expires_at.isoformat(),
                        'user': {
                            'id': new_user[0],
                            'username': new_user[1],
                            'email': new_user[2],
                            'fullName': new_user[3],
                            'userType': new_user[4],
                            'role': new_user[5]
                        }
                    })
                }
        
        elif method == 'GET':
            if session_token:
                # Проверка сессии
                cursor.execute("""
                    SELECT u.id, u.username, u.email, u.full_name, u.user_type, u.birth_date, 
                           u.fsr_id, u.coach, u.educational_institution, p.id as player_id, u.role
                    FROM users u
                    JOIN user_sessions s ON u.id = s.user_id
                    LEFT JOIN players p ON u.id = p.user_id
                    WHERE s.session_token = %s AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = true
                """, (session_token,))
                
                user = cursor.fetchone()
                if user:
                    return {
                        'statusCode': 200,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({
                            'authenticated': True,
                            'user': {
                                'id': user[0],
                                'username': user[1],
                                'email': user[2],
                                'fullName': user[3],
                                'userType': user[10] if user[10] else user[4],
                                'birthDate': user[5].isoformat() if user[5] else None,
                                'fsrId': user[6],
                                'coach': user[7],
                                'educationalInstitution': user[8],
                                'playerId': user[9],
                                'role': user[10] if user[10] else 'player'
                            }
                        })
                    }
            
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'authenticated': False})
            }
        
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()