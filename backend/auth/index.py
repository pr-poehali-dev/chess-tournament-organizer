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
            
            elif action == 'updateUserById':
                # Обновление данных любого пользователя (для админов)
                if not session_token:
                    return {
                        'statusCode': 401,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Необходима авторизация'})
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
                        'body': json.dumps({'success': False, 'error': 'Доступ запрещен'})
                    }
                
                user_id = body_data.get('userId')
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'ID пользователя не указан'})
                    }
                
                # Обновляемые поля
                update_fields = []
                update_values = []
                
                if 'fullName' in body_data:
                    update_fields.append('full_name = %s')
                    update_values.append(body_data['fullName'])
                
                if 'email' in body_data:
                    update_fields.append('email = %s')
                    update_values.append(body_data['email'].lower())
                
                if 'userType' in body_data:
                    update_fields.append('user_type = %s')
                    update_values.append(body_data['userType'])
                
                if 'birthDate' in body_data:
                    update_fields.append('birth_date = %s')
                    update_values.append(body_data['birthDate'] if body_data['birthDate'] else None)
                
                if 'fsrId' in body_data:
                    update_fields.append('fsr_id = %s')
                    update_values.append(body_data['fsrId'])
                
                if 'coach' in body_data:
                    update_fields.append('coach = %s')
                    update_values.append(body_data['coach'])
                
                if 'educationalInstitution' in body_data:
                    update_fields.append('educational_institution = %s')
                    update_values.append(body_data['educationalInstitution'])
                
                if update_fields:
                    update_values.append(user_id)
                    cursor.execute(f"""
                        UPDATE users 
                        SET {', '.join(update_fields)}
                        WHERE id = %s AND is_active = true
                    """, update_values)
                    conn.commit()
                
                # Получение обновленных данных пользователя
                cursor.execute("""
                    SELECT u.id, u.username, u.email, u.full_name, u.user_type, u.birth_date, 
                           u.fsr_id, u.coach, u.educational_institution, p.id as player_id
                    FROM users u
                    LEFT JOIN players p ON u.id = p.user_id
                    WHERE u.id = %s AND u.is_active = true
                """, (user_id,))
                
                updated_user = cursor.fetchone()
                if not updated_user:
                    return {
                        'statusCode': 404,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Пользователь не найден'})
                    }
                
                user_data = {
                    'id': updated_user[0],
                    'username': updated_user[1],
                    'email': updated_user[2],
                    'fullName': updated_user[3],
                    'userType': updated_user[4],
                    'birthDate': updated_user[5].isoformat() if updated_user[5] else None,
                    'fsrId': updated_user[6],
                    'coach': updated_user[7],
                    'educationalInstitution': updated_user[8],
                    'playerId': updated_user[9],
                    'role': 'admin' if updated_user[4] == 'admin' else 'player'
                }
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True, 'user': user_data})
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