"""
Business: API для управления турнирами администратором
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами: request_id, function_name, function_version, memory_limit_in_mb
Returns: HTTP response dict
"""

import json
import os
import psycopg2
from typing import Dict, Any, List, Optional
from psycopg2.extras import RealDictCursor
from datetime import datetime, date

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
            return get_tournaments()
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            return create_tournament(body_data, admin_user['id'])
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            return update_tournament(body_data)
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {}) or {}
            tournament_id = query_params.get('id')
            if not tournament_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не указан ID турнира'})
                }
            return delete_tournament(int(tournament_id))
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
        
        # Проверяем, что пользователь администратор или модератор
        if user and user['role'] in ['admin', 'moderator']:
            return dict(user)
        
        return None
    except Exception:
        return None

def get_tournaments() -> Dict[str, Any]:
    """Получение списка всех турниров"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            t.id,
            t.name,
            t.description,
            t.start_date,
            t.end_date,
            t.location,
            t.max_participants,
            t.registration_deadline,
            t.entry_fee,
            t.prize_fund,
            t.tournament_type,
            t.time_control,
            t.rounds,
            t.status,
            t.created_at,
            t.updated_at,
            u.full_name as created_by_name
        FROM t_p67413675_chess_tournament_org.tournaments t
        LEFT JOIN t_p67413675_chess_tournament_org.users u ON t.created_by = u.id
        ORDER BY t.created_at DESC
    """)
    
    tournaments = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # Преобразуем даты в строки для JSON
    tournaments_list = []
    for tournament in tournaments:
        tournament_dict = dict(tournament)
        for key, value in tournament_dict.items():
            if isinstance(value, (datetime, date)):
                tournament_dict[key] = value.isoformat()
            elif value is None:
                tournament_dict[key] = None
        tournaments_list.append(tournament_dict)
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'tournaments': tournaments_list,
            'total': len(tournaments_list)
        })
    }

def create_tournament(data: Dict[str, Any], created_by: int) -> Dict[str, Any]:
    """Создание нового турнира"""
    # Обязательные поля
    required_fields = ['name', 'start_date', 'end_date']
    for field in required_fields:
        if not data.get(field):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Поле "{field}" обязательно для заполнения'})
            }
    
    # Подготовка данных с значениями по умолчанию
    tournament_data = {
        'name': data['name'],
        'description': data.get('description', ''),
        'start_date': data['start_date'],
        'end_date': data['end_date'],
        'location': data.get('location', ''),
        'max_participants': data.get('max_participants', 100),
        'registration_deadline': data.get('registration_deadline'),
        'entry_fee': data.get('entry_fee', 0),
        'prize_fund': data.get('prize_fund', 0),
        'tournament_type': data.get('tournament_type', 'swiss'),
        'time_control': data.get('time_control', ''),
        'rounds': data.get('rounds', 9),
        'status': data.get('status', 'planned'),
        'created_by': created_by
    }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Вставляем новый турнир
    insert_query = """
        INSERT INTO t_p67413675_chess_tournament_org.tournaments (
            name, description, start_date, end_date, location, max_participants,
            registration_deadline, entry_fee, prize_fund, tournament_type,
            time_control, rounds, status, created_by
        ) VALUES (
            %(name)s, %(description)s, %(start_date)s, %(end_date)s, %(location)s, %(max_participants)s,
            %(registration_deadline)s, %(entry_fee)s, %(prize_fund)s, %(tournament_type)s,
            %(time_control)s, %(rounds)s, %(status)s, %(created_by)s
        ) RETURNING id, name, created_at
    """
    
    cursor.execute(insert_query, tournament_data)
    new_tournament = cursor.fetchone()
    
    conn.commit()
    cursor.close()
    conn.close()
    
    if new_tournament:
        tournament_dict = dict(new_tournament)
        # Преобразуем даты в строки
        for key, value in tournament_dict.items():
            if isinstance(value, (datetime, date)):
                tournament_dict[key] = value.isoformat()
        
        return {
            'statusCode': 201,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'tournament': tournament_dict,
                'message': 'Турнир успешно создан'
            })
        }
    else:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка при создании турнира'})
        }

def update_tournament(data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновление данных турнира"""
    tournament_id = data.get('id')
    if not tournament_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не указан ID турнира'})
        }
    
    # Подготавливаем поля для обновления
    update_fields = []
    update_values = []
    
    allowed_fields = {
        'name': 'name',
        'description': 'description',
        'start_date': 'start_date',
        'end_date': 'end_date',
        'location': 'location',
        'max_participants': 'max_participants',
        'registration_deadline': 'registration_deadline',
        'entry_fee': 'entry_fee',
        'prize_fund': 'prize_fund',
        'tournament_type': 'tournament_type',
        'time_control': 'time_control',
        'rounds': 'rounds',
        'status': 'status'
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
    update_values.append(tournament_id)  # для WHERE условия
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Обновляем турнир
    update_query = f"""
        UPDATE t_p67413675_chess_tournament_org.tournaments 
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, name, status, updated_at
    """
    
    cursor.execute(update_query, update_values)
    updated_tournament = cursor.fetchone()
    
    conn.commit()
    cursor.close()
    conn.close()
    
    if updated_tournament:
        tournament_dict = dict(updated_tournament)
        # Преобразуем даты в строки
        for key, value in tournament_dict.items():
            if isinstance(value, (datetime, date)):
                tournament_dict[key] = value.isoformat()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'tournament': tournament_dict,
                'message': 'Турнир успешно обновлен'
            })
        }
    else:
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Турнир не найден'})
        }

def delete_tournament(tournament_id: int) -> Dict[str, Any]:
    """Удаление турнира"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Проверяем, существует ли турнир
    cursor.execute("""
        SELECT id, name, status FROM t_p67413675_chess_tournament_org.tournaments 
        WHERE id = %s
    """, (tournament_id,))
    
    tournament = cursor.fetchone()
    if not tournament:
        cursor.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Турнир не найден'})
        }
    
    # Запрещаем удаление активных турниров
    if tournament['status'] == 'active':
        cursor.close()
        conn.close()
        return {
            'statusCode': 403,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Нельзя удалить активный турнир'})
        }
    
    # Помечаем турнир как отмененный вместо удаления
    cursor.execute("""
        UPDATE t_p67413675_chess_tournament_org.tournaments 
        SET status = 'cancelled', updated_at = NOW()
        WHERE id = %s
    """, (tournament_id,))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'message': f'Турнир "{tournament["name"]}" отменен'
        })
    }