import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FormValues, FormState, ReportData } from '@/types/form';
import FormInput from './ui/FormInput';
import Button from './ui/Button';
import Alert from './ui/Alert';
import ReportCard from './ReportCard';
import { generateReport } from '@/lib/api';

const SeoForm: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    isSubmitted: false,
    isError: false,
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [analysisError, setAnalysisError] = useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      email: '',
      name: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setFormState({ ...formState, isSubmitting: true, isError: false });
    setAnalysisError(undefined);

    try {
      const result = await generateReport(data);

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
          error={errors.url}
          disabled={formState.isSubmitting}
          autoFocus
        />

        <FormInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email}
          disabled={formState.isSubmitting}
        />

        <FormInput
          label="Your Name"
          type="text"
          placeholder="John Doe"
          {...register('name')}
          error={errors.name}
          disabled={formState.isSubmitting}
        />

        <Button
          type="submit"
          isLoading={formState.isSubmitting}
          fullWidth
          size="lg"
        >
          Generate Your Free SEO Report Now
        </Button>
      </form>
    </div>
  );
};

export default SeoForm; 