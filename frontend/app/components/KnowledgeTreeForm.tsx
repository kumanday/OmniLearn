import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { createKnowledgeTree } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  topic: z.string().min(3, {
    message: 'Topic must be at least 3 characters.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface KnowledgeTreeFormProps {
  onSuccess: (treeId: number) => void;
}

export function KnowledgeTreeForm({ onSuccess }: KnowledgeTreeFormProps) {
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

  function onSubmit(values: FormValues) {
    setIsLoading(true);
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
