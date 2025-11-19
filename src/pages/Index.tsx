import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Question {
  id: number;
  text: string;
}

const questions: Question[] = [
  { id: 1, text: 'Вы любите работать в команде?' },
  { id: 2, text: 'Вам нравится решать сложные задачи?' },
  { id: 3, text: 'Вы предпочитаете планировать заранее?' },
  { id: 4, text: 'Вы легко адаптируетесь к изменениям?' },
  { id: 5, text: 'Вам важна обратная связь от других?' },
];

const getResult = (answers: Record<number, boolean>): string => {
  const yesCount = Object.values(answers).filter(Boolean).length;
  
  if (yesCount === 5) {
    return 'Вы прирожденный лидер! У вас отличные навыки коммуникации и адаптации. Вы умеете работать в команде и находить решения в любых ситуациях.';
  } else if (yesCount >= 3) {
    return 'Вы сбалансированная личность! Вы гибки в подходах и умеете находить компромиссы. У вас есть потенциал для роста в разных направлениях.';
  } else if (yesCount >= 1) {
    return 'Вы индивидуалист! Вы цените самостоятельность и предпочитаете работать в своем темпе. Это ценное качество для глубокой концентрации на задачах.';
  } else {
    return 'Вы независимый мыслитель! Вы идете своим путем и не боитесь быть уникальным. Ваша самодостаточность — ваша сила.';
  }
};

const Index = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showResult, setShowResult] = useState(false);

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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        {!showResult ? (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="font-heading text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
                Опросник
              </h1>
              <p className="font-body text-gray-500 text-lg">
                Вопрос {currentQuestion + 1} из {questions.length}
              </p>
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
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-gray-900 mb-12 text-center leading-relaxed">
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
                {getResult(answers)}
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
              <div className="inline-flex items-center gap-8 text-sm text-gray-400 font-body">
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
