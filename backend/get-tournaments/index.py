import json
import os
import psycopg2
from datetime import datetime
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get tournaments from database with optional filtering
    Args: event - dict with httpMethod, queryStringParameters
          context - object with request_id attribute
    Returns: HTTP response with tournaments list
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Get query parameters
    params = event.get('queryStringParameters') or {}
    status_filter = params.get('status')  # 'upcoming', 'ongoing', 'completed'
    limit = int(params.get('limit', 10))
    
    try:
        # Connect to database
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()
        
        # Build query with filters using simple query protocol
        
        # Use simple query protocol - no parameterized queries
        if status_filter:
            query = f'''
                SELECT id, name, description, start_date, end_date, 
                       max_participants, current_participants, entry_fee, 
                       prize_pool, tournament_type, status, location, 
                       created_at
                FROM tournaments
                WHERE status = '{status_filter}'
                ORDER BY start_date ASC 
                LIMIT {limit}
            '''
        else:
            query = f'''
                SELECT id, name, description, start_date, end_date, 
                       max_participants, current_participants, entry_fee, 
                       prize_pool, tournament_type, status, location, 
                       created_at
                FROM tournaments
                ORDER BY start_date ASC 
                LIMIT {limit}
            '''
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        # Convert to list of dictionaries
        tournaments = []
        for row in rows:
            tournament = {
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'start_date': row[3].isoformat() if row[3] else None,
                'end_date': row[4].isoformat() if row[4] else None,
                'max_participants': row[5],
                'current_participants': row[6],
                'entry_fee': float(row[7]) if row[7] else 0,
                'prize_pool': float(row[8]) if row[8] else 0,
                'tournament_type': row[9],
                'status': row[10],
                'location': row[11],
                'created_at': row[12].isoformat() if row[12] else None
            }
            tournaments.append(tournament)
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'tournaments': tournaments,
                'count': len(tournaments)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }