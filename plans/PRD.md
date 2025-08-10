# OmniLearn
# OmniLearn Product Requirements Document

## Overview

OmniLearn is an adaptive learning platform that uses AI to provide personalized education to students. The application will generate a knowledge tree for a given topic, provide lesson content, and offer practice questions with feedback.

## Functional Requirements

1. **Knowledge Tree Generation**
   - The application will generate a detailed knowledge tree with sections and subsections for a given topic.
   - The knowledge tree will be represented as a JSON object with a specific structure.

2. **Lesson Content Generation**
   - The application will generate clear, concise, and engaging educational content for each subsection.
   - The content will be generated based on the subsection title and will cover all key concepts.

3. **Practice Questions Generation**
   - The backend that the front-end queries through the webhook will generate practice questions for each section.
   - The questions will start simple and gradually increase in difficulty.
   - The questions will cover all key concepts in the section.

4. **Answer Evaluation and Feedback**
   - The application will evaluate the student's answer to a practice question.
   - The application will provide instructive feedback on the student's answer.
   - If the answer is correct, the application will affirm and elaborate.
   - If the answer is incorrect, the application will guide the student toward the correct understanding without simply giving the answer.

5. **Navigation and Progress Tracking**
   - The application will allow students to navigate between subsections.
   - The application will track the student's progress through the knowledge tree.

6. **Adaptive Functionality**
   - The application will implement adaptive question generation based on student responses.
   - The application will adjust the difficulty of questions based on student performance.

## Non-Functional Requirements

1. **Performance**
   - The application will be able to handle multiple users simultaneously.

2. **Security**
   - The application will ensure the privacy and security of student data.

3. **Usability**
   - The application will have an intuitive and user-friendly interface.
   - The application will provide clear instructions and feedback to the student.

## Technical Requirements
### Database
Use PostgreSQL as the database to store user and lesson information. Create the necessary DB schema as migration files.

### Frontend
Frontend in frontend/ dir, in Next.js and Shadcn UI, loosely based on the supplied image as a conceptual mockup. Clean, intuitive interface.

### Backend
Backend in backend/ dir, in FastAPI with RESTful API.

### Infrastructure
Create a docker compose file for deploying all components.

### AI
Use pluggable LLMs for various providers, starting with Open AI, OpenRouter, Cerebras, and local inference with ollama. Have a feature flag for multimedia generation. If set, enable text-to-image and text-to-video generation of content to complement the instructional material. This should be generated ahead of time and stored so that when the user gets to that part of the lesson, the corresponding content can be delivered (since it may take several minutes to generate).

### Learning Science
Adaptability is an important component already mentioned. The Knowledge Tree and the corresponding Instructional Content and Practice Questions are all generated ahead of time. However, if the student displays total mastery or lack of mastery, the system should adapt to provide deeper coverage and more challenging questions in the former case, or more explicit and detailed descriptions of concepts  and easier practice questions in the latter case. This adaptability needs to be accounted for in the system architecture and application design.
