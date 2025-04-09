import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { seoFormSchema, ReportData } from '@/types/form';
import FormInput from './ui/FormInput';
import Button from './ui/Button';
import Alert from './ui/Alert';
import ReportCard from './ReportCard';
import { generateReport } from '@/lib/api';

// Define types needed for the form
type FormValues = {
  url: string;
  email: string;
  name: string;
  useServerAnalysis?: boolean;
};

type FormState = {
  isSubmitting: boolean;
  isSubmitted: boolean;
  isError: boolean;
  errorMessage?: string;
};

const SeoForm: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    isSubmitted: false,
    isError: false,
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [analysisError, setAnalysisError] = useState<string | undefined>(undefined);
  const [useServerAnalysis, setUseServerAnalysis] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted: formIsSubmitted },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      url: '',
      email: '',
      name: '',
    },
    mode: 'onSubmit', // Only validate on submit
  });

  const onSubmit = async (data: FormValues) => {
    setFormState({ ...formState, isSubmitting: true, isError: false });
    setAnalysisError(undefined);

    try {
      const result = await generateReport({
        ...data,
        useServerAnalysis
      });

      if (result.success && result.report) {
        setReportData(result.report);
        setAnalysisError(result.error);
        setFormState({
          isSubmitting: false,
          isSubmitted: true,
          isError: false,
        });
        reset();
      } else {
        setFormState({
          isSubmitting: false,
          isSubmitted: false,
          isError: true,
          errorMessage: result.error || 'Failed to generate report. Please try again.',
        });
      }
    } catch (error) {
      setFormState({
        isSubmitting: false,
        isSubmitted: false,
        isError: true,
        errorMessage: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  const handleReset = () => {
    setFormState({
      isSubmitting: false,
      isSubmitted: false,
      isError: false,
    });
    setReportData(null);
  };

  if (formState.isSubmitted && reportData) {
    return (
      <div className="space-y-6">
        <ReportCard report={reportData} error={analysisError} />
        <div className="text-center">
          <Button
            variant="secondary"
            onClick={handleReset}
            className="mx-auto"
          >
            Analyze Another Website
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-xl mx-auto">
      {formState.isError && (
        <div className="mb-6">
          <Alert
            type="error"
            title="Error"
            message={formState.errorMessage || 'Something went wrong. Please try again.'}
            onClose={() => setFormState({ ...formState, isError: false })}
          />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          label="Website URL"
          type="url"
          placeholder="https://yourwebsite.com"
          {...register('url')}
          error={formIsSubmitted ? errors.url : undefined}
          disabled={formState.isSubmitting}
          autoFocus
        />

        <FormInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={formIsSubmitted ? errors.email : undefined}
          disabled={formState.isSubmitting}
        />

        <FormInput
          label="Your Name"
          type="text"
          placeholder="John Doe"
          {...register('name')}
          error={formIsSubmitted ? errors.name : undefined}
          disabled={formState.isSubmitting}
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="useServerAnalysis"
            checked={useServerAnalysis}
            onChange={(e) => setUseServerAnalysis(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="useServerAnalysis" className="ml-2 block text-sm text-gray-700">
            Use enhanced analysis (more accurate but may take longer)
          </label>
        </div>

        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70"
        >
          {formState.isSubmitting 
            ? useServerAnalysis 
              ? 'Analyzing your website (this may take up to 30 seconds)...' 
              : 'Analyzing...' 
            : 'Generate Report'}
        </button>
      </form>
    </div>
  );
};

export default SeoForm; 