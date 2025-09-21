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
        
        # Query tournaments with real registration count
        cursor.execute('''
            SELECT t.id, t.name, t.description, t.start_date, t.end_date, 
                   t.max_participants, t.entry_fee, t.prize_fund, 
                   t.tournament_type, t.status, t.location, t.created_at,
                   t.time_control, t.age_category, t.start_time_msk, t.rounds,
                   COALESCE(reg_count.registered_count, 0) as registered_count
            FROM t_p67413675_chess_tournament_org.tournaments t
            LEFT JOIN (
                SELECT tournament_id, COUNT(*) as registered_count
                FROM t_p67413675_chess_tournament_org.tournament_registrations
                WHERE status = 'registered'
                GROUP BY tournament_id
            ) reg_count ON t.id = reg_count.tournament_id
            WHERE t.start_date >= CURRENT_DATE
            ORDER BY t.start_date ASC 
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
                'registered_count': row[16],  # Real count from database
                'current_participants': row[16],  # Same as registered_count
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