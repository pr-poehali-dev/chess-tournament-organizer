import json
import os
import psycopg2
from typing import Dict, Any, List, Optional
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для управления шахматными партиями и игроками
    Поддерживает создание игроков, сохранение партий, получение статистики
    """
    
    method = event.get('httpMethod', 'GET')
    
    # CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
        
        path = event.get('path', '/')
        query_params = event.get('queryStringParameters') or {}
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create_player':
                # Создание нового игрока
                name = body_data.get('name')
                email = body_data.get('email')
                
                cursor.execute(
                    "INSERT INTO players (name, email) VALUES (%s, %s) RETURNING id, name, rating",
                    (name, email)
                )
                player = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'player': {
                            'id': player[0],
                            'name': player[1],
                            'rating': player[2]
                        }
                    })
                }
            
            elif action == 'create_game':
                # Создание новой партии
                white_id = body_data.get('white_player_id')
                black_id = body_data.get('black_player_id')
                time_control = body_data.get('time_control', '10+0')
                
                cursor.execute(
                    "INSERT INTO games (white_player_id, black_player_id, time_control, result) VALUES (%s, %s, %s, 'in_progress') RETURNING id",
                    (white_id, black_id, time_control)
                )
                game_id = cursor.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'game_id': game_id
                    })
                }
            
            elif action == 'save_move':
                # Сохранение хода
                game_id = body_data.get('game_id')
                move_number = body_data.get('move_number')
                player_color = body_data.get('player_color')
                move_notation = body_data.get('move_notation')
                board_state = body_data.get('board_state')
                
                cursor.execute(
                    "INSERT INTO moves (game_id, move_number, player_color, move_notation, board_state) VALUES (%s, %s, %s, %s, %s)",
                    (game_id, move_number, player_color, move_notation, board_state)
                )
                
                # Обновляем количество ходов в партии
                cursor.execute(
                    "UPDATE games SET moves_count = %s WHERE id = %s",
                    (move_number, game_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'finish_game':
                # Завершение партии
                game_id = body_data.get('game_id')
                result = body_data.get('result')  # 'white_wins', 'black_wins', 'draw'
                
                cursor.execute(
                    "UPDATE games SET result = %s, finished_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (result, game_id)
                )
                
                # Обновляем статистику игроков
                cursor.execute("""
                    UPDATE players 
                    SET games_played = games_played + 1,
                        games_won = games_won + CASE WHEN (
                            (id = (SELECT white_player_id FROM games WHERE id = %s) AND %s = 'white_wins') OR
                            (id = (SELECT black_player_id FROM games WHERE id = %s) AND %s = 'black_wins')
                        ) THEN 1 ELSE 0 END,
                        games_lost = games_lost + CASE WHEN (
                            (id = (SELECT white_player_id FROM games WHERE id = %s) AND %s = 'black_wins') OR
                            (id = (SELECT black_player_id FROM games WHERE id = %s) AND %s = 'white_wins')
                        ) THEN 1 ELSE 0 END,
                        games_drawn = games_drawn + CASE WHEN %s = 'draw' THEN 1 ELSE 0 END,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id IN (
                        SELECT white_player_id FROM games WHERE id = %s
                        UNION
                        SELECT black_player_id FROM games WHERE id = %s
                    )
                """, (game_id, result, game_id, result, game_id, result, game_id, result, result, game_id, game_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True})
                }
        
        elif method == 'GET':
            if 'players' in path:
                # Получение списка игроков
                cursor.execute("SELECT id, name, rating, games_played, games_won, games_lost, games_drawn FROM players ORDER BY rating DESC")
                players = cursor.fetchall()
                
                players_list = []
                for p in players:
                    players_list.append({
                        'id': p[0],
                        'name': p[1],
                        'rating': p[2],
                        'games_played': p[3],
                        'games_won': p[4],
                        'games_lost': p[5],
                        'games_drawn': p[6]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'players': players_list})
                }
            
            elif 'games' in path:
                # Получение списка партий
                limit = int(query_params.get('limit', 50))
                cursor.execute("""
                    SELECT g.id, g.result, g.moves_count, g.started_at, g.finished_at,
                           pw.name as white_name, pb.name as black_name
                    FROM games g
                    LEFT JOIN players pw ON g.white_player_id = pw.id
                    LEFT JOIN players pb ON g.black_player_id = pb.id
                    ORDER BY g.started_at DESC
                    LIMIT %s
                """, (limit,))
                games = cursor.fetchall()
                
                games_list = []
                for g in games:
                    games_list.append({
                        'id': g[0],
                        'result': g[1],
                        'moves_count': g[2],
                        'started_at': g[3].isoformat() if g[3] else None,
                        'finished_at': g[4].isoformat() if g[4] else None,
                        'white_player': g[5],
                        'black_player': g[6]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'games': games_list})
                }
            
            elif 'game' in path and query_params.get('id'):
                # Получение конкретной партии с ходами
                game_id = query_params.get('id')
                
                cursor.execute("""
                    SELECT g.*, pw.name as white_name, pb.name as black_name
                    FROM games g
                    LEFT JOIN players pw ON g.white_player_id = pw.id
                    LEFT JOIN players pb ON g.black_player_id = pb.id
                    WHERE g.id = %s
                """, (game_id,))
                game = cursor.fetchone()
                
                cursor.execute("""
                    SELECT move_number, player_color, move_notation, board_state
                    FROM moves
                    WHERE game_id = %s
                    ORDER BY move_number
                """, (game_id,))
                moves = cursor.fetchall()
                
                if game:
                    game_data = {
                        'id': game[0],
                        'white_player': game[11],
                        'black_player': game[12],
                        'result': game[3],
                        'moves_count': game[4],
                        'started_at': game[6].isoformat() if game[6] else None,
                        'finished_at': game[7].isoformat() if game[7] else None,
                        'moves': [
                            {
                                'move_number': m[0],
                                'player_color': m[1],
                                'notation': m[2],
                                'board_state': m[3]
                            } for m in moves
                        ]
                    }
                    
                    return {
                        'statusCode': 200,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'game': game_data})
                    }
        
        return {
            'statusCode': 404,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Endpoint not found'})
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