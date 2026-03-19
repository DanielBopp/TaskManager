import React, { useState, useEffect } from 'react';
import type { Task, TaskRequest, TaskStatus } from '../types/task';
import { STATUS_OPTIONS } from '../utils/taskUtils';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: TaskRequest) => Promise<void>;
  onCancel: () => void;
  categories: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  status?: string;
  category?: string;
}

const EMPTY_FORM: TaskRequest = {
  title: '',
  description: '',
  status: 'TODO',
  dueDate: '',
  category: '',
};

export function TaskForm({ initialData, onSubmit, onCancel, categories }: TaskFormProps) {
  const [form, setForm] = useState<TaskRequest>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      // Convert ISO datetime string to "YYYY-MM-DDTHH:mm" for datetime-local input
      const dueDateValue = initialData.dueDate
        ? initialData.dueDate.substring(0, 16)
        : '';
      setForm({
        title: initialData.title,
        description: initialData.description ?? '',
        status: initialData.status,
        dueDate: dueDateValue,
        category: initialData.category ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setApiError(null);
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (form.title.trim().length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }
    if (form.description && form.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }
    if (!form.status) {
      newErrors.status = 'Status is required';
    }
    if (form.category && form.category.length > 100) {
      newErrors.category = 'Category must not exceed 100 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);
    try {
      // datetime-local gives "2026-04-01T14:30", Spring needs "2026-04-01T14:30:00"
      const rawDue = form.dueDate;
      const dueDate = rawDue
        ? rawDue.length === 16 ? rawDue + ':00' : rawDue
        : undefined;
      const payload: TaskRequest = {
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        status: form.status as TaskStatus,
        dueDate,
        category: form.category?.trim() || undefined,
      };
      await onSubmit(payload);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string; errors?: string[] } } }).response;
        const errorData = response?.data;
        if (errorData?.errors?.length) {
          setApiError(errorData.errors.join(', '));
        } else {
          setApiError(errorData?.message ?? 'Failed to save task');
        }
      } else {
        setApiError('Network error. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" data-testid="task-form">
      {apiError && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm"
        >
          {apiError}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          maxLength={101}
          placeholder="Enter task title"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.title ? (
            <span id="title-error" className="text-red-500 text-xs">{errors.title}</span>
          ) : <span />}
          <span className="text-gray-400 text-xs">{form.title.length}/100</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          maxLength={501}
          rows={3}
          placeholder="Optional description..."
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'desc-error' : undefined}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            errors.description ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <span id="desc-error" className="text-red-500 text-xs">{errors.description}</span>
          ) : <span />}
          <span className="text-gray-400 text-xs">{(form.description ?? '').length}/500</span>
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          name="status"
          value={form.status}
          onChange={handleChange}
          aria-invalid={!!errors.status}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.status ? 'border-red-400' : 'border-gray-300'
          }`}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
      </div>

      {/* Due Date & Time */}
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          Due Date & Time
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="datetime-local"
          value={form.dueDate}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <input
          id="category"
          name="category"
          type="text"
          value={form.category}
          onChange={handleChange}
          list="category-suggestions"
          placeholder="e.g. Work, Personal, Hobby"
          aria-invalid={!!errors.category}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.category ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        <datalist id="category-suggestions">
          {categories.map(cat => <option key={cat} value={cat} />)}
        </datalist>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
        >
          {submitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
