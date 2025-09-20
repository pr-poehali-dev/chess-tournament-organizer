import json
import os

def handler(event, context):
    '''
    Business: Get tournaments from database
    Args: event, context
    Returns: HTTP response with tournaments list
    '''
    method = event.get('httpMethod', 'GET')
    
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
    
    try:
        import psycopg2
        
        print(f"Connecting to database...")
        # Connect to database
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()
        print(f"Connected successfully")
        
        # Query tournaments with all fields needed for frontend
        cursor.execute('''
            SELECT id, name, description, start_date, end_date, 
                   max_participants, entry_fee, prize_fund, 
                   tournament_type, status, location, created_at,
                   time_control, age_category, start_time_msk, rounds
            FROM t_p67413675_chess_tournament_org.tournaments
            WHERE start_date >= CURRENT_DATE
            ORDER BY start_date ASC 
            LIMIT 10
        ''')
        
        rows = cursor.fetchall()
        print(f"Found {len(rows)} tournaments")
        
        # Convert to list of dictionaries
        tournaments = []
        for row in rows:
            tournament = {
                'id': row[0],
                'name': row[1] or 'Турнир',
                'description': row[2] or '',
                'start_date': row[3].isoformat() if row[3] else None,
                'end_date': row[4].isoformat() if row[4] else None,
                'max_participants': row[5] or 100,
                'registered_count': 0,  # TODO: get from registrations table
                'current_participants': 0,
                'entry_fee': float(row[6]) if row[6] else 0,
                'prize_fund': float(row[7]) if row[7] else 0,
                'tournament_type': row[8] or 'swiss',
                'status': row[9] or 'planned',
                'location': row[10] or 'Онлайн',
                'created_at': row[11].isoformat() if row[11] else None,
                'time_control': row[12] or '90+30',
                'age_category': row[13] or 'открытая',
                'start_time_msk': str(row[14]) if row[14] else '10:00',
                'rounds': row[15] or 9
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
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }