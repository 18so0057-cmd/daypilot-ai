import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ label, error, className, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-muted">{label}</label>}
      <input ref={ref} id={id} className={cn('input-base', error && 'border-error-400 focus:border-error-400 focus:ring-error-400/30', className)} {...props} />
      {error && <p className="text-xs text-error-500">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label?: string }>(
  ({ label, className, id, children, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-muted">{label}</label>}
      <select ref={ref} id={id} className={cn('input-base cursor-pointer', className)} {...props}>
        {children}
      </select>
    </div>
  ),
);
Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  ({ label, className, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-muted">{label}</label>}
      <textarea ref={ref} id={id} className={cn('input-base resize-none', className)} {...props} />
    </div>
  ),
);
Textarea.displayName = 'Textarea';
