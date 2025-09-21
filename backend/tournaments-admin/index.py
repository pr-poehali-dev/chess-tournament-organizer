"""
Business: API для управления турнирами администратором с подсчётом реальных регистраций
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами: request_id, function_name, function_version, memory_limit_in_mb
Returns: HTTP response dict
"""

import json
import os
import psycopg2
from typing import Dict, Any, List, Optional

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
    
    return psycopg2.connect(database_url)

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
        if user and user[4] in ['admin', 'moderator']:  # role is at index 4
            return {
                'id': user[0],
                'username': user[1], 
                'email': user[2],
                'full_name': user[3],
                'role': user[4],
                'user_type': user[5]
            }
        
        return None
    except Exception:
        return None

def get_tournaments() -> Dict[str, Any]:
    """Получение списка всех турниров с реальным подсчётом регистраций"""
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
            u.full_name as created_by_name,
            COALESCE(reg_count.registered_count, 0) as registered_count
        FROM t_p67413675_chess_tournament_org.tournaments t
        LEFT JOIN t_p67413675_chess_tournament_org.users u ON t.created_by = u.id
        LEFT JOIN (
            SELECT tournament_id, COUNT(*) as registered_count
            FROM t_p67413675_chess_tournament_org.tournament_registrations
            WHERE status = 'registered'
            GROUP BY tournament_id
        ) reg_count ON t.id = reg_count.tournament_id
        ORDER BY t.created_at DESC
    """)
    
    tournaments = cursor.fetchall()
    cursor.close()
    conn.close()
    
    # Преобразуем данные из tuple в dict
    tournaments_list = []
    for row in tournaments:
        tournament_dict = {
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'start_date': row[3].isoformat() if row[3] else None,
            'end_date': row[4].isoformat() if row[4] else None,
            'location': row[5],
            'max_participants': row[6],
            'registration_deadline': row[7].isoformat() if row[7] else None,
            'entry_fee': float(row[8]) if row[8] else 0,
            'prize_fund': float(row[9]) if row[9] else 0,
            'tournament_type': row[10],
            'time_control': row[11],
            'rounds': row[12],
            'status': row[13],
            'created_at': row[14].isoformat() if row[14] else None,
            'updated_at': row[15].isoformat() if row[15] else None,
            'created_by_name': row[16],
            'registered_count': row[17]
        }
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
    result = cursor.fetchone()
    conn.commit()
    
    # Получаем полную информацию о созданном турнире
    cursor.execute("""
        SELECT 
            t.id, t.name, t.description, t.start_date, t.end_date, t.location,
            t.max_participants, t.registration_deadline, t.entry_fee, t.prize_fund,
            t.tournament_type, t.time_control, t.rounds, t.status, t.created_at, t.updated_at,
            u.full_name as created_by_name
        FROM t_p67413675_chess_tournament_org.tournaments t
        LEFT JOIN t_p67413675_chess_tournament_org.users u ON t.created_by = u.id
        WHERE t.id = %s
    """, (result[0],))
    
    new_tournament = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if new_tournament:
        tournament_dict = {
            'id': new_tournament[0],
            'name': new_tournament[1],
            'description': new_tournament[2],
            'start_date': new_tournament[3].isoformat() if new_tournament[3] else None,
            'end_date': new_tournament[4].isoformat() if new_tournament[4] else None,
            'location': new_tournament[5],
            'max_participants': new_tournament[6],
            'registration_deadline': new_tournament[7].isoformat() if new_tournament[7] else None,
            'entry_fee': float(new_tournament[8]) if new_tournament[8] else 0,
            'prize_fund': float(new_tournament[9]) if new_tournament[9] else 0,
            'tournament_type': new_tournament[10],
            'time_control': new_tournament[11],
            'rounds': new_tournament[12],
            'status': new_tournament[13],
            'created_at': new_tournament[14].isoformat() if new_tournament[14] else None,
            'updated_at': new_tournament[15].isoformat() if new_tournament[15] else None,
            'created_by_name': new_tournament[16],
            'registered_count': 0  # Новый турнир без регистраций
        }
        
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
        tournament_dict = {
            'id': updated_tournament[0],
            'name': updated_tournament[1],
            'status': updated_tournament[2],
            'updated_at': updated_tournament[3].isoformat() if updated_tournament[3] else None
        }
        
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
    if tournament[2] == 'active':  # status is at index 2
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
            'message': f'Турнир "{tournament[1]}" отменен'  # name is at index 1
        })
    }