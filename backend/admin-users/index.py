"""
Business: API для управления пользователями администратором
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами: request_id, function_name, function_version, memory_limit_in_mb
Returns: HTTP response dict
"""

import json
import os
import psycopg2
from typing import Dict, Any, List, Optional
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Получаем токен сессии для проверки прав администратора
    headers = event.get('headers', {})
    session_token = headers.get('X-Session-Token') or headers.get('x-session-token')
    
    # Проверяем права администратора
    admin_user = check_admin_rights(session_token)
    if not admin_user:
        return {
            'statusCode': 403,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Доступ запрещен. Требуются права администратора'})
        }
    
    try:
        if method == 'GET':
            return get_users()
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            return update_user(body_data)
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            user_id = query_params.get('id')
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не указан ID пользователя'})
                }
            return delete_user(int(user_id))
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Метод не поддерживается'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }

def get_db_connection():
    """Получение подключения к базе данных"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL не настроен')
    
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def check_admin_rights(session_token: Optional[str]) -> Optional[Dict[str, Any]]:
    """Проверка прав администратора по токену сессии"""
    if not session_token:
        return None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Получаем пользователя по токену сессии
        cursor.execute("""
            SELECT u.id, u.username, u.email, u.full_name, u.role, u.user_type
            FROM t_p67413675_chess_tournament_org.users u
            JOIN t_p67413675_chess_tournament_org.user_sessions s ON u.id = s.user_id
            WHERE s.session_token = %s AND s.expires_at > NOW()
        """, (session_token,))
        
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        # Проверяем, что пользователь администратор
        if user and user['role'] == 'admin':
            return dict(user)
        
        return None
    except Exception:
        return None

def get_users() -> Dict[str, Any]:
    """Получение списка всех пользователей"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            id,
            username,
            email,
            full_name,
            role,
            user_type,
            is_active,
            created_at,
            last_login,
            date_of_birth,
            gender,
            fcr_id,
            educational_institution,
            trainer_name,
            representative_email,
            representative_phone
        FROM t_p67413675_chess_tournament_org.users
        ORDER BY created_at DESC
    """)
    
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # Преобразуем даты в строки для JSON
    users_list = []
    for user in users:
        user_dict = dict(user)
        for key, value in user_dict.items():
            if isinstance(value, datetime):
                user_dict[key] = value.isoformat()
            elif value is None:
                user_dict[key] = None
        users_list.append(user_dict)
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'users': users_list,
            'total': len(users_list)
        })
    }

def update_user(data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновление данных пользователя"""
    user_id = data.get('id')
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не указан ID пользователя'})
        }
    
    # Подготавливаем поля для обновления
    update_fields = []
    update_values = []
    
    allowed_fields = {
        'full_name': 'full_name',
        'email': 'email', 
        'role': 'role',
        'user_type': 'user_type',
        'is_active': 'is_active',
        'date_of_birth': 'date_of_birth',
        'gender': 'gender',
        'fcr_id': 'fcr_id',
        'educational_institution': 'educational_institution',
        'trainer_name': 'trainer_name',
        'representative_email': 'representative_email',
        'representative_phone': 'representative_phone'
    }
    
    for field, db_field in allowed_fields.items():
        if field in data:
            update_fields.append(f"{db_field} = %s")
            update_values.append(data[field])
    
    if not update_fields:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Нет данных для обновления'})
        }
    
    # Добавляем updated_at
    update_fields.append("updated_at = NOW()")
    update_values.append(user_id)  # для WHERE условия
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Обновляем пользователя
    update_query = f"""
        UPDATE t_p67413675_chess_tournament_org.users 
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, username, email, full_name, role, user_type, is_active, updated_at
    """
    
    cursor.execute(update_query, update_values)
    updated_user = cursor.fetchone()
    
    conn.commit()
    cursor.close()
    conn.close()
    
    if updated_user:
        user_dict = dict(updated_user)
        # Преобразуем даты в строки
        for key, value in user_dict.items():
            if isinstance(value, datetime):
                user_dict[key] = value.isoformat()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'user': user_dict,
                'message': 'Пользователь успешно обновлен'
            })
        }
    else:
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пользователь не найден'})
        }

def delete_user(user_id: int) -> Dict[str, Any]:
    """Удаление пользователя (мягкое удаление - деактивация)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Проверяем, существует ли пользователь
    cursor.execute("""
        SELECT id, username, role FROM t_p67413675_chess_tournament_org.users 
        WHERE id = %s
    """, (user_id,))
    
    user = cursor.fetchone()
    if not user:
        cursor.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Пользователь не найден'})
        }
    
    # Запрещаем удаление администраторов
    if user['role'] == 'admin':
        cursor.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Нельзя удалить администратора'})
        }
    
    # Деактивируем пользователя
    cursor.execute("""
        UPDATE t_p67413675_chess_tournament_org.users 
        SET is_active = false, updated_at = NOW()
        WHERE id = %s
    """, (user_id,))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'message': f'Пользователь {user["username"]} деактивирован'
        })
    }