import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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

const getResult = (answers: Record<number, boolean>, patterns: ResultPattern[]): string => {
  for (const pattern of patterns) {
    if (Object.keys(pattern.answerPattern).length === 0) {
      continue;
    }
    
    const matches = Object.entries(pattern.answerPattern).every(([qId, expectedAnswer]) => {
      return answers[parseInt(qId)] === expectedAnswer;
    });
    
    if (matches) {
      return pattern.resultText;
    }
  }
  
  const defaultPattern = patterns.find(p => Object.keys(p.answerPattern).length === 0);
  return defaultPattern?.resultText || 'Спасибо за прохождение опросника!';
};

const Index = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [patterns, setPatterns] = useState<ResultPattern[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: boolean) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setShowResult(true);
      }, 300);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
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

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">
            Нет вопросов
          </h2>
          <p className="font-body text-gray-500 mb-6">
            Добавьте вопросы в панели управления
          </p>
          <Button onClick={() => window.location.href = '/admin'} className="font-body">
            <Icon name="Settings" className="mr-2" size={18} />
            Открыть панель
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/admin'}
            className="font-body"
          >
            <Icon name="Settings" size={18} />
          </Button>
        </div>

        {!showResult ? (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="font-heading sm:text-5xl font-bold text-gray-900 mb-3 text-3xl">Оценить возможность постановки на учет граждан в качестве нуждающихся в жилых помещениях, предоставляемых 
по договорам социального найма (жилищный учет)</h1>
              <p className="font-body text-gray-500 text-lg">Ответьте на вопрос ниже, пожалуйста</p>
            </div>

            <div className="mb-8">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <Card className="p-8 sm:p-12 shadow-lg border-0 animate-scale-in">
              <h2 className="font-heading sm:text-3xl font-semibold text-gray-900 mb-12 text-center leading-relaxed text-2xl">
                {questions[currentQuestion].text}
              </h2>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handleAnswer(true)}
                  size="lg"
                  className="font-body text-lg px-12 py-6 rounded-xl hover:scale-105 transition-transform"
                >
                  <Icon name="Check" className="mr-2" size={24} />
                  Да
                </Button>
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  size="lg"
                  className="font-body text-lg px-12 py-6 rounded-xl hover:scale-105 transition-transform"
                >
                  <Icon name="X" className="mr-2" size={24} />
                  Нет
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 animate-scale-in">
                <Icon name="Sparkles" size={40} className="text-primary" />
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
                Ваш результат
              </h1>
            </div>

            <Card className="p-8 sm:p-12 shadow-lg border-0">
              <p className="font-body text-xl text-gray-700 leading-relaxed mb-8 text-center">
                {getResult(answers, patterns)}
              </p>

              <div className="flex justify-center">
                <Button
                  onClick={resetQuiz}
                  size="lg"
                  variant="outline"
                  className="font-body text-lg px-8 py-6 rounded-xl hover:scale-105 transition-transform"
                >
                  <Icon name="RotateCcw" className="mr-2" size={20} />
                  Пройти заново
                </Button>
              </div>
            </Card>

            <div className="mt-8 text-center">
              <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-gray-400 font-body">
                {questions.map((q, idx) => (
                  <div key={q.id} className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium">Вопрос {idx + 1}:</span>
                    {answers[q.id] ? (
                      <Icon name="Check" size={18} className="text-primary" />
                    ) : (
                      <Icon name="X" size={18} className="text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;