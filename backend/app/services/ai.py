from fastapi import Depends
from typing import List, Dict, Any, Optional
import json
import os
import httpx
from openai import OpenAI

from app.core.config import settings


class AIService:
    def __init__(self):
        self.enable_multimedia = settings.ENABLE_MULTIMEDIA
        if not settings.OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY environment variable is required but not set")
        self.openai_client = OpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1"
        )

    async def generate_knowledge_tree(self, topic: str) -> Dict[str, Any]:
        """Generate a knowledge tree for a given topic."""
        try:
            prompt = f"""
            Generate a detailed knowledge tree for the topic: {topic}.
            
            The knowledge tree should have 3-5 main sections, each with 2-4 subsections.
            
            For each section and subsection, provide a title and a brief description.
            
            Format the response as a JSON object with the following structure:
            {{
                "sections": [
                    {{
                        "title": "Section Title",
                        "description": "Section description",
                        "subsections": [
                            {{
                                "title": "Subsection Title",
                                "description": "Subsection description"
                            }}
                        ]
                    }}
                ]
            }}
            """
            
            response = self.openai_client.chat.completions.create(
                model="qwen/qwen-2.5-72b-instruct",
                messages=[
                    {"role": "system", "content": "You are an educational content creator. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("OpenAI API returned empty content")
                
            return json.loads(content)
            
        except Exception as e:
            print(f"Error generating knowledge tree: {str(e)}")
            raise ValueError(f"Failed to generate knowledge tree: {str(e)}")

    async def generate_lesson_content(self, subsection_title: str, subsection_description: str) -> str:
        """Generate lesson content for a subsection."""
        prompt = f"""
        Generate clear, concise, and engaging educational content for the following subsection:
        
        Title: {subsection_title}
        Description: {subsection_description}
        
        The content should be comprehensive and cover all key concepts related to the subsection.
        Use examples, analogies, and clear explanations to make the content accessible.
        Format the content with appropriate headings, paragraphs, and bullet points.
        """
        
        response = self.openai_client.chat.completions.create(
            model="qwen/qwen-2.5-72b-instruct",
            messages=[
                {"role": "system", "content": "You are an educational content creator."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.choices[0].message.content

    async def generate_multimedia(self, title: str, content: str) -> List[str]:
        """Generate multimedia content for a lesson."""
        if not self.enable_multimedia:
            return []
        
        # Extract key concepts from the content
        prompt = f"""
        Extract 1-2 key concepts from the following lesson content that would benefit from visual representation:
        
        Title: {title}
        
        Content: {content}
        
        For each concept, provide a brief description of what the image should depict.
        """
        
        response = self.openai_client.chat.completions.create(
            model="qwen/qwen-2.5-72b-instruct",
            messages=[
                {"role": "system", "content": "You are an educational content creator."},
                {"role": "user", "content": prompt}
            ]
        )
        
        concepts = response.choices[0].message.content.split("\n\n")
        
        # Generate images for each concept
        image_urls = []
        for concept in concepts[:2]:  # Limit to 2 images
            response = self.openai_client.images.generate(
                model="dall-e-3",
                prompt=f"Educational illustration for {title}: {concept}",
                n=1,
                size="1024x1024"
            )
            
            image_urls.append(response.data[0].url)
        
        return image_urls

    async def generate_questions(
        self, section_title: str, section_description: str, difficulty: str = "medium"
    ) -> List[Dict[str, Any]]:
        """Generate practice questions for a section."""
        prompt = f"""
        Generate 3 practice questions for the following section:
        
        Title: {section_title}
        Description: {section_description}
        Difficulty: {difficulty}
        
        The questions should cover key concepts from the section and be appropriate for the specified difficulty level.
        For each question, provide the question text and the correct answer.
        
        Format the response as a JSON array with the following structure:
        [
            {{
                "text": "Question text",
                "difficulty": "{difficulty}",
                "correct_answer": "Correct answer"
            }}
        ]
        """
        
        response = self.openai_client.chat.completions.create(
            model="qwen/qwen-2.5-72b-instruct",
            messages=[
                {"role": "system", "content": "You are an educational content creator."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)

    async def evaluate_answer(
        self, question: str, correct_answer: str, student_answer: str
    ) -> Dict[str, Any]:
        """Evaluate a student's answer to a question."""
        prompt = f"""
        Evaluate the student's answer to the following question:
        
        Question: {question}
        Correct Answer: {correct_answer}
        Student's Answer: {student_answer}
        
        Determine if the student's answer is correct or incorrect.
        Provide constructive feedback on the student's answer.
        If the answer is correct, affirm and elaborate.
        If the answer is incorrect, guide the student toward the correct understanding without simply giving the answer.
        
        Format the response as a JSON object with the following structure:
        {{
            "is_correct": true/false,
            "feedback": "Feedback on the student's answer"
        }}
        """
        
        response = self.openai_client.chat.completions.create(
            model="qwen/qwen-2.5-72b-instruct",
            messages=[
                {"role": "system", "content": "You are an educational content evaluator."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)