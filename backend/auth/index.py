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
            if action == 'register':
                # Регистрация нового пользователя
                username = body_data.get('username', '').strip()
                email = body_data.get('email', '').strip().lower()
                password = body_data.get('password', '')
                full_name = body_data.get('fullName', '')
                date_of_birth = body_data.get('dateOfBirth')
                birth_date = body_data.get('birthDate')  # Новое поле для даты рождения
                gender = body_data.get('gender', 'male')
                fcr_id = body_data.get('fcrId', '')
                fsr_id = body_data.get('fsrId', '')  # Новое поле ID ФШР
                educational_institution = body_data.get('educationalInstitution', '')
                trainer_name = body_data.get('trainerName', '')
                coach = body_data.get('coach', '')  # Новое поле тренер
                representative_email = body_data.get('representativeEmail', '')
                representative_phone = body_data.get('representativePhone', '')
                user_type = body_data.get('userType', 'child')
                
                # Валидация
                if not username or not email or not password or not full_name:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Заполните все обязательные поля'})
                    }
                
                if len(password) < 6:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'})
                    }
                
                # Проверка уникальности
                cursor.execute("SELECT id FROM users WHERE email = %s OR username = %s", (email, username))
                if cursor.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Пользователь с таким email или именем уже существует'})
                    }
                
                # Хеширование пароля
                password_hash = hashlib.sha256((password + 'chess_salt_2024').encode()).hexdigest()
                
                # Создание пользователя
                cursor.execute("""
                    INSERT INTO users (username, email, password_hash, full_name, date_of_birth, birth_date,
                                     gender, fcr_id, fsr_id, educational_institution, trainer_name, coach,
                                     representative_email, representative_phone, user_type)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, username, email, full_name, user_type
                """, (username, email, password_hash, full_name, date_of_birth, birth_date, gender, 
                      fcr_id, fsr_id, educational_institution, trainer_name, coach, representative_email, 
                      representative_phone, user_type))
                
                user = cursor.fetchone()
                user_id = user[0]
                
                # Создание связанного игрока
                cursor.execute("""
                    INSERT INTO players (name, email, user_id) 
                    VALUES (%s, %s, %s) 
                    RETURNING id
                """, (full_name, email, user_id))
                
                player_id = cursor.fetchone()[0]
                
                # Создание сессии
                session_token = secrets.token_urlsafe(32)
                expires_at = datetime.now() + timedelta(days=30)
                
                cursor.execute("""
                    INSERT INTO user_sessions (user_id, session_token, expires_at)
                    VALUES (%s, %s, %s)
                """, (user_id, session_token, expires_at))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'user': {
                            'id': user[0],
                            'username': user[1],
                            'email': user[2],
                            'fullName': user[3],
                            'userType': user[4],
                            'playerId': player_id
                        },
                        'sessionToken': session_token,
                        'expiresAt': expires_at.isoformat()
                    })
                }
            
            elif action == 'login':
                # Вход пользователя
                email = body_data.get('email', '').strip().lower()
                password = body_data.get('password', '')
                
                if not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Введите email и пароль'})
                    }
                
                # Хеширование пароля
                password_hash = hashlib.sha256((password + 'chess_salt_2024').encode()).hexdigest()
                
                # Поиск пользователя
                cursor.execute("""
                    SELECT u.id, u.username, u.email, u.full_name, u.user_type, u.is_active, p.id as player_id
                    FROM users u
                    LEFT JOIN players p ON u.id = p.user_id
                    WHERE u.email = %s AND u.password_hash = %s
                """, (email, password_hash))
                
                user = cursor.fetchone()
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Неверный email или пароль'})
                    }
                
                if not user[5]:  # is_active
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Аккаунт заблокирован'})
                    }
                
                # Обновление времени входа
                cursor.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s", (user[0],))
                
                # Создание новой сессии
                session_token = secrets.token_urlsafe(32)
                expires_at = datetime.now() + timedelta(days=30)
                
                cursor.execute("""
                    INSERT INTO user_sessions (user_id, session_token, expires_at)
                    VALUES (%s, %s, %s)
                """, (user[0], session_token, expires_at))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'user': {
                            'id': user[0],
                            'username': user[1],
                            'email': user[2],
                            'fullName': user[3],
                            'userType': user[4],
                            'playerId': user[6]
                        },
                        'sessionToken': session_token,
                        'expiresAt': expires_at.isoformat()
                    })
                }
            
            elif action == 'logout':
                # Выход пользователя
                if session_token:
                    cursor.execute("DELETE FROM user_sessions WHERE session_token = %s", (session_token,))
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'getAllUsers':
                # Получение всех пользователей (только для админов)
                if not session_token:
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
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
                        'headers': cors_headers,
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
            
            elif action == 'updateProfile':
                # Обновление собственного профиля
                if not session_token:
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Необходима авторизация'})
                    }
                
                # Получение ID текущего пользователя
                cursor.execute("""
                    SELECT u.id
                    FROM users u
                    JOIN user_sessions s ON u.id = s.user_id
                    WHERE s.session_token = %s AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = true
                """, (session_token,))
                
                current_user = cursor.fetchone()
                if not current_user:
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Сессия недействительна'})
                    }
                
                user_id = current_user[0]
                
                # Обновление данных пользователя
                update_fields = []
                update_values = []
                
                for field, db_field in [
                    ('fullName', 'full_name'),
                    ('email', 'email'),
                    ('username', 'username'),
                    ('birthDate', 'birth_date'),
                    ('fsrId', 'fsr_id'),
                    ('coach', 'coach'),
                    ('educationalInstitution', 'educational_institution'),
                    ('userType', 'user_type')
                ]:
                    if field in body_data and body_data[field] is not None:
                        update_fields.append(f"{db_field} = %s")
                        update_values.append(body_data[field])
                
                if update_fields:
                    update_values.append(user_id)
                    cursor.execute(f"""
                        UPDATE users 
                        SET {', '.join(update_fields)}
                        WHERE id = %s
                    """, update_values)
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'updateUserById':
                # Обновление пользователя по ID (только для админов)
                if not session_token:
                    return {
                        'statusCode': 401,
                        'headers': cors_headers,
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
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Доступ запрещен'})
                    }
                
                user_id = body_data.get('userId')
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Не указан ID пользователя'})
                    }
                
                # Обновление данных пользователя
                update_fields = []
                update_values = []
                
                for field, db_field in [
                    ('fullName', 'full_name'),
                    ('email', 'email'),
                    ('username', 'username'),
                    ('birthDate', 'birth_date'),
                    ('fsrId', 'fsr_id'),
                    ('coach', 'coach'),
                    ('educationalInstitution', 'educational_institution'),
                    ('userType', 'user_type')
                ]:
                    if field in body_data and body_data[field] is not None:
                        update_fields.append(f"{db_field} = %s")
                        update_values.append(body_data[field])
                
                if update_fields:
                    update_values.append(user_id)
                    cursor.execute(f"""
                        UPDATE users 
                        SET {', '.join(update_fields)}
                        WHERE id = %s
                    """, update_values)
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True})
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
                'headers': cors_headers,
                'body': json.dumps({'authenticated': False})
            }
        
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()