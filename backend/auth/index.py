import json
import os
import psycopg2
import hashlib
import secrets
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для регистрации и авторизации пользователей
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
            if action == 'getAllUsers':
                # Получение всех пользователей (только для админов)
                if not session_token:
                    return {
                        'statusCode': 401,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Необходима авторизация'})
                    }
                
                # Проверка прав администратора
                cursor.execute("""
                    SELECT u.user_type
                    FROM users u
                    JOIN user_sessions s ON u.id = s.user_id
                    WHERE s.session_token = %s AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = true
                """, (session_token,))
                
                current_user = cursor.fetchone()
                if not current_user or current_user[0] != 'admin':
                    return {
                        'statusCode': 403,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Доступ запрещен'})
                    }
                
                # Получение всех пользователей
                cursor.execute("""
                    SELECT u.id, u.username, u.email, u.full_name, u.user_type, u.birth_date, 
                           u.fsr_id, u.coach, u.educational_institution, p.id as player_id
                    FROM users u
                    LEFT JOIN players p ON u.id = p.user_id
                    WHERE u.is_active = true
                    ORDER BY u.created_at DESC
                """)
                
                users = cursor.fetchall()
                users_list = []
                for user in users:
                    users_list.append({
                        'id': user[0],
                        'username': user[1],
                        'email': user[2],
                        'fullName': user[3],
                        'userType': user[4],
                        'birthDate': user[5].isoformat() if user[5] else None,
                        'fsrId': user[6],
                        'coach': user[7],
                        'educationalInstitution': user[8],
                        'playerId': user[9],
                        'role': 'admin' if user[4] == 'admin' else 'player'
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps(users_list)
                }
        
        elif method == 'GET':
            if session_token:
                # Проверка сессии
                cursor.execute("""
                    SELECT u.id, u.username, u.email, u.full_name, u.user_type, u.birth_date, 
                           u.fsr_id, u.coach, u.educational_institution, p.id as player_id
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
                                'userType': user[4],
                                'birthDate': user[5].isoformat() if user[5] else None,
                                'fsrId': user[6],
                                'coach': user[7],
                                'educationalInstitution': user[8],
                                'playerId': user[9],
                                'role': 'admin' if user[4] == 'admin' else 'player'
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