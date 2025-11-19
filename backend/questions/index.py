import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления вопросами и правилами результатов опросника
    Args: event - dict с httpMethod, body, queryStringParameters
          context - object с attributes: request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            resource_type = params.get('type', 'questions')
            
            if resource_type == 'rules':
                cur.execute('SELECT id, min_yes, max_yes, result_text FROM result_rules ORDER BY min_yes DESC')
                rules = []
                for row in cur.fetchall():
                    rules.append({
                        'id': row[0],
                        'minYes': row[1],
                        'maxYes': row[2],
                        'resultText': row[3]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'rules': rules})
                }
            else:
                cur.execute('SELECT id, text, position FROM questions ORDER BY position')
                questions = []
                for row in cur.fetchall():
                    questions.append({
                        'id': row[0],
                        'text': row[1],
                        'position': row[2]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'questions': questions})
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            resource_type = body_data.get('type', 'question')
            
            if resource_type == 'rule':
                min_yes = body_data['minYes']
                max_yes = body_data['maxYes']
                result_text = body_data['resultText']
                
                cur.execute(
                    'INSERT INTO result_rules (min_yes, max_yes, result_text) VALUES (%s, %s, %s) RETURNING id',
                    (min_yes, max_yes, result_text)
                )
                rule_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'id': rule_id, 'success': True})
                }
            else:
                text = body_data['text']
                cur.execute('SELECT COALESCE(MAX(position), 0) + 1 FROM questions')
                position = cur.fetchone()[0]
                
                cur.execute(
                    'INSERT INTO questions (text, position) VALUES (%s, %s) RETURNING id',
                    (text, position)
                )
                question_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'id': question_id, 'success': True})
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            resource_type = body_data.get('type', 'question')
            
            if resource_type == 'rule':
                rule_id = body_data['id']
                min_yes = body_data['minYes']
                max_yes = body_data['maxYes']
                result_text = body_data['resultText']
                
                cur.execute(
                    'UPDATE result_rules SET min_yes = %s, max_yes = %s, result_text = %s WHERE id = %s',
                    (min_yes, max_yes, result_text, rule_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            else:
                question_id = body_data['id']
                text = body_data['text']
                
                cur.execute(
                    'UPDATE questions SET text = %s WHERE id = %s',
                    (text, question_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            question_id = int(params.get('id', 0))
            
            cur.execute('DELETE FROM questions WHERE id = %s', (question_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()