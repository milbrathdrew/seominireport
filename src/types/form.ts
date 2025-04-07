import { z } from 'zod';

export const formSchema = z.object({
  url: z.string()
    .url({ message: 'Please enter a valid URL including http:// or https://' })
    .min(1, { message: 'URL is required' }),
  email: z.string()
    .email({ message: 'Please enter a valid email address' })
    .min(1, { message: 'Email is required' }),
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name cannot exceed 50 characters' })
});

export type FormValues = z.infer<typeof formSchema>;

export type FormState = {
  isSubmitting: boolean;
  isSubmitted: boolean;
  isError: boolean;
  errorMessage?: string;
};

export type ReportData = {
  url: string;
  date: string;
  scores: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  recommendations: string[];
}; 