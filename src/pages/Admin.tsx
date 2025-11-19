import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/c76d76bf-8700-499d-ad27-e18742053256';

interface Question {
  id: number;
  text: string;
  position: number;
}

interface ResultRule {
  id: number;
  minYes: number;
  maxYes: number;
  resultText: string;
}

const Admin = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [rules, setRules] = useState<ResultRule[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newRule, setNewRule] = useState({ minYes: 0, maxYes: 0, resultText: '' });
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [editingRule, setEditingRule] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [questionsRes, rulesRes] = await Promise.all([
        fetch(`${API_URL}?type=questions`),
        fetch(`${API_URL}?type=rules`)
      ]);
      
      const questionsData = await questionsRes.json();
      const rulesData = await rulesRes.json();
      
      setQuestions(questionsData.questions || []);
      setRules(rulesData.rules || []);
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
      const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
      
      if (res.ok) {
        toast({ title: 'Вопрос удален' });
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const addRule = async () => {
    if (!newRule.resultText.trim()) return;
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rule', ...newRule })
      });
      
      if (res.ok) {
        toast({ title: 'Правило добавлено' });
        setNewRule({ minYes: 0, maxYes: 0, resultText: '' });
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const updateRule = async (rule: ResultRule) => {
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rule', ...rule })
      });
      
      if (res.ok) {
        toast({ title: 'Правило обновлено' });
        setEditingRule(null);
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
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
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold text-gray-900 mb-2">
              Панель управления
            </h1>
            <p className="font-body text-gray-500">
              Редактирование вопросов и правил результатов
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

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Card className="p-6 shadow-lg border-0">
              <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Icon name="ListChecks" className="mr-3 text-primary" size={24} />
                Вопросы
              </h2>

              <div className="space-y-4 mb-6">
                {questions.map((q) => (
                  <div key={q.id} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                    {editingQuestion === q.id ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-body text-gray-700">{q.text}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingQuestion(q.id)}
                        >
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestion(q.id)}
                        >
                          <Icon name="Trash2" size={16} className="text-red-500" />
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

          <div>
            <Card className="p-6 shadow-lg border-0">
              <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Icon name="Sparkles" className="mr-3 text-primary" size={24} />
                Правила результатов
              </h2>

              <div className="space-y-4 mb-6">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 bg-gray-50 rounded-lg">
                    {editingRule === rule.id ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Мин"
                            defaultValue={rule.minYes}
                            onChange={(e) => rule.minYes = parseInt(e.target.value)}
                            className="w-20"
                          />
                          <Input
                            type="number"
                            placeholder="Макс"
                            defaultValue={rule.maxYes}
                            onChange={(e) => rule.maxYes = parseInt(e.target.value)}
                            className="w-20"
                          />
                        </div>
                        <Textarea
                          defaultValue={rule.resultText}
                          onChange={(e) => rule.resultText = e.target.value}
                          className="font-body"
                        />
                        <Button onClick={() => updateRule(rule)} size="sm" className="font-body">
                          Сохранить
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-body text-sm font-medium text-primary">
                            {rule.minYes} - {rule.maxYes} ответов "Да"
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingRule(rule.id)}
                          >
                            <Icon name="Pencil" size={16} />
                          </Button>
                        </div>
                        <p className="font-body text-sm text-gray-700">{rule.resultText}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3 p-4 bg-primary/5 rounded-lg">
                <h3 className="font-body font-medium text-gray-900">Добавить правило</h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Мин"
                    value={newRule.minYes}
                    onChange={(e) => setNewRule({ ...newRule, minYes: parseInt(e.target.value) || 0 })}
                    className="w-20 font-body"
                  />
                  <Input
                    type="number"
                    placeholder="Макс"
                    value={newRule.maxYes}
                    onChange={(e) => setNewRule({ ...newRule, maxYes: parseInt(e.target.value) || 0 })}
                    className="w-20 font-body"
                  />
                </div>
                <Textarea
                  placeholder="Текст результата..."
                  value={newRule.resultText}
                  onChange={(e) => setNewRule({ ...newRule, resultText: e.target.value })}
                  className="font-body"
                />
                <Button onClick={addRule} className="w-full font-body">
                  <Icon name="Plus" className="mr-2" size={18} />
                  Добавить правило
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
