import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';

import styles from './interaction-primitives.module.css';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> {
  readonly label: string;
  readonly loading?: boolean;
}

export function IconButton({
  label,
  children,
  loading = false,
  disabled,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  if (!label.trim()) throw new Error('IconButton requires an accessible label.');
  return (
    <button
      {...props}
      type={type}
      className={[styles.iconButton, className].filter(Boolean).join(' ')}
      aria-label={label}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
}

export function Field({ label, hint, error, id, className, ...props }: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const description =
    [
      props['aria-describedby'],
      hint ? `${inputId}-hint` : undefined,
      error ? `${inputId}-error` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId}>{label}</label>
      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={description}
      />
      {hint ? <p id={`${inputId}-hint`}>{hint}</p> : null}
      {error ? (
        <p className={styles.error} id={`${inputId}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface FeedbackPanelProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly tone?: 'info' | 'success' | 'warning' | 'danger';
  readonly action?: ReactNode;
}

export function FeedbackPanel({ title, children, tone = 'info', action }: FeedbackPanelProps) {
  const urgent = tone === 'danger';
  return (
    <div
      className={styles.feedback}
      data-tone={tone}
      role={urgent ? 'alert' : 'status'}
      aria-live={urgent ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <strong>{title}</strong>
      <div>{children}</div>
      {action}
    </div>
  );
}
