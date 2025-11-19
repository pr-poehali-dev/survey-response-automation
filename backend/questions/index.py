import json
import os
import psycopg2
import psycopg2.extras
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
            
            if resource_type == 'patterns':
                cur.execute('SELECT id, result_text, answer_pattern, priority FROM result_patterns ORDER BY priority')
                patterns = []
                for row in cur.fetchall():
                    patterns.append({
                        'id': row[0],
                        'resultText': row[1],
                        'answerPattern': row[2],
                        'priority': row[3]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'patterns': patterns})
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
            
            if resource_type == 'pattern':
                result_text = body_data['resultText']
                answer_pattern = json.dumps(body_data['answerPattern'])
                priority = body_data.get('priority', 0)
                
                cur.execute(
                    'INSERT INTO result_patterns (result_text, answer_pattern, priority) VALUES (%s, %s, %s) RETURNING id',
                    (result_text, answer_pattern, priority)
                )
                pattern_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'id': pattern_id, 'success': True})
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
            
            if resource_type == 'pattern':
                pattern_id = body_data['id']
                result_text = body_data['resultText']
                answer_pattern = json.dumps(body_data['answerPattern'])
                priority = body_data.get('priority', 0)
                
                cur.execute(
                    'UPDATE result_patterns SET result_text = %s, answer_pattern = %s, priority = %s WHERE id = %s',
                    (result_text, answer_pattern, priority, pattern_id)
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
            resource_type = params.get('type', 'question')
            resource_id = int(params.get('id', 0))
            
            if resource_type == 'pattern':
                cur.execute('DELETE FROM result_patterns WHERE id = %s', (resource_id,))
            else:
                cur.execute('DELETE FROM questions WHERE id = %s', (resource_id,))
            
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
