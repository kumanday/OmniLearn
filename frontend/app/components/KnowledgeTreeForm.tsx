import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { createKnowledgeTree } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';

const formSchema = z.object({
  topic: z.string().min(3, {
    message: 'Topic must be at least 3 characters.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface KnowledgeTreeFormProps {
  onSuccess: (treeId: number) => void;
}

type KnowledgeTreeSection = {
  id: number
  tree_id: number
  title: string
  description: string
  subsections: Array<{ id: number; section_id: number; title: string; description: string }>
}

type KnowledgeTreeData = {
  id: number
  topic: string
  sections: KnowledgeTreeSection[]
}

interface ExtendedProps extends KnowledgeTreeFormProps {
  guestMode?: boolean
  onSuccessData?: (tree: KnowledgeTreeData) => void
}

export function KnowledgeTreeForm({ onSuccess, guestMode, onSuccessData }: ExtendedProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  const mutation = useMutation({
    mutationFn: createKnowledgeTree,
    onSuccess: (data) => {
      setIsLoading(false);
      onSuccess(data.id);
    },
    onError: (error) => {
      setIsLoading(false);
      console.error('Error creating knowledge tree:', error);
    },
  });

  function generateMockKnowledgeTree(topic: string): KnowledgeTreeData {
    let nextId = 1
    const treeId = nextId++
    const sections: KnowledgeTreeSection[] = Array.from({ length: 3 }).map((_, sIdx) => {
      const sectionId = nextId++
      const title = `Section ${sIdx + 1}`
      const description = `Overview of ${topic} - part ${sIdx + 1}`
      const subsections = Array.from({ length: 3 }).map((__, subIdx) => {
        const subId = nextId++
        return { 
          id: subId, 
          section_id: sectionId, 
          title: `${title} - Topic ${subIdx + 1}`, 
          description: `Details on ${topic} / ${title} #${subIdx + 1}`,
          section_title: title,
          section_id_for_questions: sectionId
        }
      })
      return { id: sectionId, tree_id: treeId, title, description, subsections }
    })
    return { id: treeId, topic, sections }
  }

  function onSubmit(values: FormValues) {
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form submitted with values:', values);
    console.log('guestMode value:', guestMode);
    console.log('guestMode type:', typeof guestMode);
    console.log('guestMode === true:', guestMode === true);
    console.log('onSuccessData callback:', onSuccessData);
    console.log('onSuccessData type:', typeof onSuccessData);
    console.log('================================');
    
    setIsLoading(true);
    
    // ALWAYS use guest mode when guestMode is true
    if (guestMode === true) {
      console.log('✅ ENTERING GUEST MODE - Generating mock knowledge tree...');
      setTimeout(() => {
        const data = generateMockKnowledgeTree(values.topic)
        console.log('✅ Generated mock data:', data);
        setIsLoading(false)
        if (onSuccessData) {
          console.log('✅ Calling onSuccessData callback');
          onSuccessData(data)
        } else {
          console.error('❌ onSuccessData callback is missing!')
        }
      }, 300)
      console.log('✅ Exiting guest mode function early');
      return; // Exit early, don't call API
    }
    
    // Only use API when NOT in guest mode
    console.log('❌ NOT in guest mode - Using real API...');
    console.log('❌ This should NOT happen when guestMode === true');
    mutation.mutate(values.topic);
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create a Learning Path</CardTitle>
        <CardDescription>
          Enter a topic you want to learn about, and we'll create a personalized learning path for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Machine Learning, JavaScript, World History" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Learning Path'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}