"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { createKnowledgeTree } from "../lib/api";

const formSchema = z.object({
  topic: z.string().min(3, {
    message: "Topic must be at least 3 characters.",
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
      topic: "",
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
      console.error("Error creating knowledge tree:", error);
    },
  });

  function onSubmit(values: FormValues) {
    setIsLoading(true);
    mutation.mutate(values.topic);
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Knowledge Tree</CardTitle>
        <CardDescription>
          Enter a topic to generate a personalized learning path.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Quantum Physics" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate Knowledge Tree"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}