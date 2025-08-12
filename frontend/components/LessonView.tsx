"use client";

import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { getLessonBySubsection } from "../app/lib/api";

interface LessonViewProps {
  subsectionId: number;
}

export default function LessonView({ subsectionId }: LessonViewProps) {
  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ["lesson", subsectionId],
    queryFn: () => getLessonBySubsection(subsectionId),
    enabled: !!subsectionId,
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading lesson content...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Error loading lesson content. Please try again.
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-4">
        No lesson content available for this subsection.
      </div>
    );
  }

  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{lesson.content}</ReactMarkdown>
      
      {lesson.multimedia && lesson.multimedia.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Visual Aids</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.multimedia.map((url, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <img src={url} alt={`Visual aid ${index + 1}`} className="w-full h-auto" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}