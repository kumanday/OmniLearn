import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createQuestions, getQuestionsBySection } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuestionView from './QuestionView';

interface LessonViewProps {
  subsectionId: number;
  lesson: any;
  isLoading: boolean;
}

export default function LessonView({ subsectionId, lesson, isLoading }: LessonViewProps) {
  const [showQuestions, setShowQuestions] = useState(false);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string>('');

  const { data: questions, isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['questions', sectionId],
    queryFn: () => getQuestionsBySection(sectionId!),
    enabled: !!sectionId && showQuestions,
  });

  const mutation = useMutation({
    mutationFn: ({ sectionId, sectionTitle }: { sectionId: number; sectionTitle: string }) => 
      createQuestions(sectionId, sectionTitle),
    onSuccess: () => {
      // Refetch questions after creating them
      // This is handled automatically by React Query
    },
  });

  const handlePracticeClick = (sectionId: number, sectionTitle: string) => {
    setSectionId(sectionId);
    setSectionTitle(sectionTitle);
    setShowQuestions(true);
    
    // Check if we need to generate questions
    if (!questions || questions.length === 0) {
      mutation.mutate({ sectionId, sectionTitle });
    }
  };

  const handleBackToLesson = () => {
    setShowQuestions(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading lesson content...</p>
        </CardContent>
      </Card>
    );
  }

  if (!lesson) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Lesson not found. Please select another topic.</p>
        </CardContent>
      </Card>
    );
  }

  if (showQuestions && sectionId) {
    return (
      <QuestionView 
        questions={questions || []} 
        isLoading={isQuestionsLoading || mutation.isPending} 
        onBack={handleBackToLesson}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lesson.subsection_title}</CardTitle>
        <CardDescription>
          Learn at your own pace and test your knowledge when ready
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
        
        {lesson.multimedia_urls && lesson.multimedia_urls.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Visual Aids</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.multimedia_urls.map((url: string, index: number) => (
                <img 
                  key={index} 
                  src={url} 
                  alt={`Visual aid ${index + 1}`} 
                  className="rounded-md max-h-64 object-contain"
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBackToLesson}>
          Back to Learning Path
        </Button>
        <Button onClick={() => handlePracticeClick(lesson.section_id, lesson.section_title)}>
          Practice Questions
        </Button>
      </CardFooter>
    </Card>
  );
}