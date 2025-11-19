import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/c76d76bf-8700-499d-ad27-e18742053256';

interface Question {
  id: number;
  text: string;
  position: number;
}

interface ResultPattern {
  id: number;
  resultText: string;
  answerPattern: Record<string, boolean>;
  priority: number;
}

const Admin = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [patterns, setPatterns] = useState<ResultPattern[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newPattern, setNewPattern] = useState<Partial<ResultPattern>>({
    resultText: '',
    answerPattern: {},
    priority: 0
  });
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [editingPattern, setEditingPattern] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [questionsRes, patternsRes] = await Promise.all([
        fetch(`${API_URL}?type=questions`),
        fetch(`${API_URL}?type=patterns`)
      ]);
      
      const questionsData = await questionsRes.json();
      const patternsData = await patternsRes.json();
      
      setQuestions(questionsData.questions || []);
      setPatterns(patternsData.patterns || []);
      
      const defaultPattern: Record<string, boolean> = {};
      (questionsData.questions || []).forEach((q: Question) => {
        defaultPattern[q.id.toString()] = false;
      });
      setNewPattern(prev => ({ ...prev, answerPattern: defaultPattern }));
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async () => {
    if (!newQuestionText.trim()) return;
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'question', text: newQuestionText })
      });
      
      if (res.ok) {
        toast({ title: 'Вопрос добавлен' });
        setNewQuestionText('');
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const updateQuestion = async (id: number, text: string) => {
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'question', id, text })
      });
      
      if (res.ok) {
        toast({ title: 'Вопрос обновлен' });
        setEditingQuestion(null);
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const deleteQuestion = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}?id=${id}&type=question`, { method: 'DELETE' });
      
      if (res.ok) {
        toast({ title: 'Вопрос удален' });
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const addPattern = async () => {
    if (!newPattern.resultText?.trim()) return;
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pattern', ...newPattern })
      });
      
      if (res.ok) {
        toast({ title: 'Комбинация добавлена' });
        const defaultPattern: Record<string, boolean> = {};
        questions.forEach(q => {
          defaultPattern[q.id.toString()] = false;
        });
        setNewPattern({ resultText: '', answerPattern: defaultPattern, priority: 0 });
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const updatePattern = async (pattern: ResultPattern) => {
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pattern', ...pattern })
      });
      
      if (res.ok) {
        toast({ title: 'Комбинация обновлена' });
        setEditingPattern(null);
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const deletePattern = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}?id=${id}&type=pattern`, { method: 'DELETE' });
      
      if (res.ok) {
        toast({ title: 'Комбинация удалена' });
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const toggleAnswer = (patternId: number | null, questionId: string, isNew: boolean = false) => {
    if (isNew) {
      setNewPattern(prev => ({
        ...prev,
        answerPattern: {
          ...prev.answerPattern,
          [questionId]: !prev.answerPattern?.[questionId]
        }
      }));
    } else if (patternId !== null) {
      setPatterns(prev => prev.map(p => {
        if (p.id === patternId) {
          return {
            ...p,
            answerPattern: {
              ...p.answerPattern,
              [questionId]: !p.answerPattern[questionId]
            }
          };
        }
        return p;
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin">
          <Icon name="Loader2" size={40} className="text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold text-gray-900 mb-2">
              Панель управления
            </h1>
            <p className="font-body text-gray-500">
              Редактирование вопросов и комбинаций ответов
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="font-body"
          >
            <Icon name="ArrowLeft" className="mr-2" size={18} />
            К опроснику
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-lg border-0">
              <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Icon name="ListChecks" className="mr-3 text-primary" size={24} />
                Вопросы
              </h2>

              <div className="space-y-3 mb-6">
                {questions.map((q) => (
                  <div key={q.id} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                    {editingQuestion === q.id ? (
                      <Input
                        defaultValue={q.text}
                        onBlur={(e) => {
                          if (e.target.value !== q.text) {
                            updateQuestion(q.id, e.target.value);
                          } else {
                            setEditingQuestion(null);
                          }
                        }}
                        className="flex-1 font-body"
                        autoFocus
                      />
                    ) : (
                      <>
                        <Badge variant="secondary" className="mt-1">#{q.id}</Badge>
                        <span className="flex-1 font-body text-gray-700 text-sm">{q.text}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingQuestion(q.id)}
                        >
                          <Icon name="Pencil" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestion(q.id)}
                        >
                          <Icon name="Trash2" size={14} className="text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Новый вопрос..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="font-body"
                  onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                />
                <Button onClick={addQuestion} className="font-body">
                  <Icon name="Plus" size={18} />
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="p-6 shadow-lg border-0">
              <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Icon name="Sparkles" className="mr-3 text-primary" size={24} />
                Комбинации ответов
              </h2>

              <div className="space-y-4 mb-6">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="p-4 bg-gray-50 rounded-lg">
                    {editingPattern === pattern.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={pattern.resultText}
                          onChange={(e) => {
                            setPatterns(prev => prev.map(p => 
                              p.id === pattern.id ? { ...p, resultText: e.target.value } : p
                            ));
                          }}
                          className="font-body"
                        />
                        <div className="flex flex-wrap gap-2">
                          {questions.map(q => (
                            <Button
                              key={q.id}
                              variant={pattern.answerPattern[q.id.toString()] ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleAnswer(pattern.id, q.id.toString())}
                              className="font-body text-xs"
                            >
                              <Badge variant="secondary" className="mr-1">#{q.id}</Badge>
                              {pattern.answerPattern[q.id.toString()] ? 'Да' : 'Нет'}
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => updatePattern(pattern)} size="sm" className="font-body">
                            Сохранить
                          </Button>
                          <Button 
                            onClick={() => setEditingPattern(null)} 
                            variant="outline" 
                            size="sm"
                            className="font-body"
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-body text-sm text-gray-700 flex-1">{pattern.resultText}</p>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingPattern(pattern.id)}
                            >
                              <Icon name="Pencil" size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePattern(pattern.id)}
                            >
                              <Icon name="Trash2" size={14} className="text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {questions.map(q => (
                            <Badge 
                              key={q.id}
                              variant={pattern.answerPattern[q.id.toString()] ? "default" : "outline"}
                              className="text-xs"
                            >
                              #{q.id}: {pattern.answerPattern[q.id.toString()] ? 'Да' : 'Нет'}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3 p-4 bg-primary/5 rounded-lg">
                <h3 className="font-body font-medium text-gray-900">Добавить комбинацию</h3>
                <Textarea
                  placeholder="Текст результата..."
                  value={newPattern.resultText}
                  onChange={(e) => setNewPattern({ ...newPattern, resultText: e.target.value })}
                  className="font-body"
                />
                <div className="flex flex-wrap gap-2">
                  {questions.map(q => (
                    <Button
                      key={q.id}
                      variant={newPattern.answerPattern?.[q.id.toString()] ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAnswer(null, q.id.toString(), true)}
                      className="font-body text-xs"
                    >
                      <Badge variant="secondary" className="mr-1">#{q.id}</Badge>
                      {newPattern.answerPattern?.[q.id.toString()] ? 'Да' : 'Нет'}
                    </Button>
                  ))}
                </div>
                <Button onClick={addPattern} className="w-full font-body">
                  <Icon name="Plus" className="mr-2" size={18} />
                  Добавить комбинацию
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
