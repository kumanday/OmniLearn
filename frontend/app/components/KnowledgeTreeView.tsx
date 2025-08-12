import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getKnowledgeTree, getLessonBySubsection } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import LessonView from './LessonView';

interface KnowledgeTreeViewProps {
  treeId: number;
}

export default function KnowledgeTreeView({ treeId }: KnowledgeTreeViewProps) {
  const [activeSection, setActiveSection] = useState<string>('0');
  const [activeSubsection, setActiveSubsection] = useState<number | null>(null);

  const { data: tree, isLoading, error } = useQuery({
    queryKey: ['knowledgeTree', treeId],
    queryFn: () => getKnowledgeTree(treeId),
  });

  const { data: lesson, isLoading: isLessonLoading } = useQuery({
    queryKey: ['lesson', activeSubsection],
    queryFn: () => getLessonBySubsection(activeSubsection!),
    enabled: !!activeSubsection,
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
            <LessonView 
              subsectionId={activeSubsection} 
              lesson={lesson} 
              isLoading={isLessonLoading} 
            />
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