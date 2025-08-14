import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getKnowledgeTree, getLessonBySubsection } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LessonView from './LessonView';

type Subsection = { 
  id: number; 
  section_id: number; 
  title: string; 
  description: string;
  section_title: string;
  section_id_for_questions: number;
}
type Section = { id: number; tree_id: number; title: string; description: string; subsections: Subsection[] }
type KnowledgeTree = { id: number; topic: string; sections: Section[] }

interface KnowledgeTreeViewProps {
  treeId?: number;
  data?: KnowledgeTree;
  guestMode?: boolean;
}

export default function KnowledgeTreeView({ treeId, data, guestMode }: KnowledgeTreeViewProps) {
  const [activeSection, setActiveSection] = useState<string>('0');
  const [activeSubsection, setActiveSubsection] = useState<number | null>(null);

  const { data: tree, isLoading, error } = useQuery({
    queryKey: ['knowledgeTree', treeId],
    queryFn: () => getKnowledgeTree(treeId as number),
    enabled: !!treeId && !data,
    initialData: data,
  });

  const { data: lesson, isLoading: isLessonLoading } = useQuery({
    queryKey: ['lesson', activeSubsection],
    queryFn: () => getLessonBySubsection(activeSubsection!),
    enabled: !!activeSubsection && !guestMode,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading your learning path...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading learning path</div>;
  }

  const handleSubsectionClick = (subsectionId: number) => {
    setActiveSubsection(subsectionId);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">{tree.topic}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Learning Path</CardTitle>
              <CardDescription>Navigate through your personalized curriculum</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                <TabsList className="w-full justify-start mb-4 overflow-x-auto">
                  {tree.sections.map((section, index) => (
                    <TabsTrigger key={section.id} value={index.toString()}>
                      {section.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {tree.sections.map((section, index) => (
                  <TabsContent key={section.id} value={index.toString()} className="space-y-4">
                    <div className="text-sm text-gray-500 mb-4">{section.description}</div>
                    
                    {section.subsections.map((subsection) => (
                      <Button
                        key={subsection.id}
                        variant={activeSubsection === subsection.id ? "default" : "outline"}
                        className="w-full justify-start text-left mb-2"
                        onClick={() => handleSubsectionClick(subsection.id)}
                      >
                        {subsection.title}
                      </Button>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {activeSubsection ? (
            guestMode ? (
              <GuestLessonView 
                subsectionId={activeSubsection}
                subsection={tree.sections
                  .flatMap(s => s.subsections)
                  .find(sub => sub.id === activeSubsection)}
              />
            ) : (
              <LessonView 
                subsectionId={activeSubsection} 
                lesson={lesson} 
                isLoading={isLessonLoading} 
              />
            )
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">
                  Select a topic from the learning path to begin
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Guest mode lesson view with simulated content
function GuestLessonView({ subsectionId, subsection }: { subsectionId: number; subsection: Subsection }) {
  const [showQuestions, setShowQuestions] = useState(false);
  
  if (showQuestions) {
    return (
      <GuestQuestionView 
        sectionId={subsection.section_id_for_questions}
        sectionTitle={subsection.section_title}
        onBack={() => setShowQuestions(false)}
      />
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{subsection.title}</CardTitle>
        <CardDescription>
          Learn at your own pace and test your knowledge when ready
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">
              Welcome to <strong>{subsection.title}</strong>! This section covers essential concepts 
              that will help you build a solid foundation in your learning journey.
            </p>
            
            <p className="text-base leading-relaxed">
              {subsection.description}
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <h3 className="font-semibold text-blue-800 mb-2">Key Learning Objectives:</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Understand the fundamental principles</li>
                <li>Apply concepts to real-world scenarios</li>
                <li>Develop critical thinking skills</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <h3 className="font-semibold text-green-800 mb-2">Pro Tips:</h3>
              <p className="text-green-700">
                Take your time to absorb the material. Learning is a journey, not a race!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setShowQuestions(false)}>
          Back to Learning Path
        </Button>
        <Button onClick={() => setShowQuestions(true)}>
          Practice Questions
        </Button>
      </CardFooter>
    </Card>
  );
}

// Guest mode question view with simulated questions and feedback
function GuestQuestionView({ sectionId, sectionTitle, onBack }: { 
  sectionId: number; 
  sectionTitle: string; 
  onBack: () => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Generate mock questions for the section
  const mockQuestions = [
    {
      id: 1,
      text: `What is the primary concept covered in "${sectionTitle}"?`,
      difficulty: 'easy',
      correctAnswer: 'The fundamental principles and core concepts of the topic',
      feedback: 'Great understanding! This section focuses on building foundational knowledge.'
    },
    {
      id: 2,
      text: `How would you apply the concepts from "${sectionTitle}" in a practical scenario?`,
      difficulty: 'medium',
      correctAnswer: 'By identifying real-world applications and practicing with examples',
      feedback: 'Excellent thinking! Practical application helps solidify theoretical knowledge.'
    },
    {
      id: 3,
      text: `What are the key benefits of mastering the concepts in "${sectionTitle}"?`,
      difficulty: 'hard',
      correctAnswer: 'Improved problem-solving skills and deeper understanding of the subject',
      feedback: 'Perfect! Mastery of fundamentals enables advanced learning and innovation.'
    }
  ];
  
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const currentQuestion = mockQuestions[currentQuestionIndex];
    // Simulate AI evaluation with basic keyword matching
    const isCorrect = userAnswer.toLowerCase().includes('concept') || 
                     userAnswer.toLowerCase().includes('principle') ||
                     userAnswer.toLowerCase().includes('fundamental') ||
                     userAnswer.toLowerCase().includes('practical') ||
                     userAnswer.toLowerCase().includes('apply') ||
                     userAnswer.toLowerCase().includes('benefit') ||
                     userAnswer.toLowerCase().includes('skill');
    
    setFeedback({
      is_correct: isCorrect,
      feedback: isCorrect ? currentQuestion.feedback : 
        'Good effort! Consider how this relates to the core concepts and practical applications.',
      correct_answer: currentQuestion.correctAnswer
    });
    setShowFeedback(true);
  };
  
  const handleNextQuestion = () => {
    setUserAnswer('');
    setFeedback(null);
    setShowFeedback(false);
    
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onBack(); // Return to lesson when all questions are answered
    }
  };
  
  const currentQuestion = mockQuestions[currentQuestionIndex];
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
            <CardTitle>Practice Question {currentQuestionIndex + 1}/{mockQuestions.length}</CardTitle>
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
          <textarea
            placeholder="Type your answer here..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="min-h-[120px] w-full p-3 border rounded-md resize-none"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back to Lesson
          </Button>
          <Button 
            onClick={handleSubmitAnswer} 
            disabled={!userAnswer.trim()}
          >
            Submit Answer
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
              {currentQuestionIndex < mockQuestions.length - 1 ? 'Next Question' : 'Finish Practice'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}