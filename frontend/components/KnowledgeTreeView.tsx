"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getKnowledgeTree } from "../lib/api";
import LessonView from "./LessonView";
import QuestionView from "./QuestionView";

interface KnowledgeTreeViewProps {
  treeId: number;
}

export default function KnowledgeTreeView({ treeId }: KnowledgeTreeViewProps) {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [activeSubsection, setActiveSubsection] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"lesson" | "practice">("lesson");

  const { data: tree, isLoading, error } = useQuery({
    queryKey: ["knowledgeTree", treeId],
    queryFn: () => getKnowledgeTree(treeId),
    enabled: !!treeId,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading knowledge tree...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading knowledge tree. Please try again.
      </div>
    );
  }

  if (!tree) {
    return null;
  }

  const handleSectionClick = (sectionId: number) => {
    setActiveSection(sectionId);
    setActiveSubsection(null);
  };

  const handleSubsectionClick = (subsectionId: number) => {
    setActiveSubsection(subsectionId);
    setActiveTab("lesson");
  };

  const activeSubsectionData = activeSection && activeSubsection
    ? tree.sections
        .find(section => section.id === activeSection)
        ?.subsections.find(subsection => subsection.id === activeSubsection)
    : null;

  const activeSectionData = activeSection
    ? tree.sections.find(section => section.id === activeSection)
    : null;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{tree.topic}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {tree.sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className={`text-left font-medium w-full ${
                        activeSection === section.id ? "text-blue-600" : ""
                      }`}
                    >
                      {section.title}
                    </button>
                    
                    {activeSection === section.id && (
                      <ul className="ml-4 mt-2 space-y-2">
                        {section.subsections.map((subsection) => (
                          <li key={subsection.id}>
                            <button
                              onClick={() => handleSubsectionClick(subsection.id)}
                              className={`text-left text-sm w-full ${
                                activeSubsection === subsection.id ? "text-blue-600 font-medium" : ""
                              }`}
                            >
                              {subsection.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          {activeSubsection && activeSubsectionData ? (
            <Card>
              <CardHeader>
                <CardTitle>{activeSubsectionData.title}</CardTitle>
                <CardDescription>{activeSubsectionData.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "lesson" | "practice")}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="lesson">Lesson</TabsTrigger>
                    <TabsTrigger value="practice">Practice</TabsTrigger>
                  </TabsList>
                  <TabsContent value="lesson">
                    <LessonView subsectionId={activeSubsection} />
                  </TabsContent>
                  <TabsContent value="practice">
                    {activeSectionData && (
                      <QuestionView sectionId={activeSection} />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : activeSection && activeSectionData ? (
            <Card>
              <CardHeader>
                <CardTitle>{activeSectionData.title}</CardTitle>
                <CardDescription>{activeSectionData.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Select a subsection from the menu to view its content.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Welcome to {tree.topic}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Select a section from the menu to begin learning.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}