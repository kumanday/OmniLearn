import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { evaluateAnswer } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Question {
  id: number;
  text: string;
  difficulty: string;
}

interface QuestionViewProps {
  questions: Question[];
  isLoading: boolean;
  onBack: () => void;
}

export default function QuestionView({ questions, isLoading, onBack }: QuestionViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const mutation = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: number; answer: string }) => 
      evaluateAnswer(questionId, answer),
    onSuccess: (data) => {
      setFeedback(data);
      setShowFeedback(true);
    },
  });

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    mutation.mutate({ 
      questionId: currentQuestion.id, 
      answer: userAnswer 
    });
  };

  const handleNextQuestion = () => {
    setUserAnswer('');
    setFeedback(null);
    setShowFeedback(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onBack(); // Return to lesson when all questions are answered
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading practice questions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">No questions available for this topic yet.</p>
          <div className="flex justify-center mt-4">
            <Button onClick={onBack}>Back to Lesson</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const difficultyColor = {
    easy: 'text-green-500',
    medium: 'text-yellow-500',
    hard: 'text-red-500',
  }[currentQuestion.difficulty] || 'text-gray-500';

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Practice Question {currentQuestionIndex + 1}/{questions.length}</CardTitle>
            <span className={`text-sm font-medium ${difficultyColor}`}>
              {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
            </span>
          </div>
          <CardDescription>
            Test your understanding of the material
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg font-medium">{currentQuestion.text}</div>
          <Textarea
            placeholder="Type your answer here..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="min-h-[120px]"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back to Lesson
          </Button>
          <Button 
            onClick={handleSubmitAnswer} 
            disabled={!userAnswer.trim() || mutation.isPending}
          >
            {mutation.isPending ? 'Evaluating...' : 'Submit Answer'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={feedback?.is_correct ? 'text-green-500' : 'text-red-500'}>
              {feedback?.is_correct ? 'Correct!' : 'Not quite right'}
            </DialogTitle>
            <DialogDescription className="pt-4">
              {feedback?.feedback}
              
              {!feedback?.is_correct && feedback?.correct_answer && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <p className="font-medium">Correct answer:</p>
                  <p>{feedback.correct_answer}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}