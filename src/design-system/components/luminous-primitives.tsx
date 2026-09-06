import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

import styles from './luminous-primitives.module.css';

export const glassCardVariants = ['soft', 'standard', 'strong', 'dark'] as const;
export type GlassCardVariant = (typeof glassCardVariants)[number];
export type GlassCardElement = 'div' | 'section' | 'article';

export interface GlassCardProps extends HTMLAttributes<HTMLElement> {
  readonly as?: GlassCardElement;
  readonly variant?: GlassCardVariant;
  readonly children: ReactNode;
}

const glassCardVariantClass: Readonly<Record<GlassCardVariant, string | undefined>> = {
  soft: styles.glassSoft,
  standard: styles.glassStandard,
  strong: styles.glassStrong,
  dark: styles.glassDark,
};

export function GlassCard({
  as: Element = 'div',
  variant = 'standard',
  className,
  children,
  ...props
}: GlassCardProps) {
  const classes = [styles.glassCard, glassCardVariantClass[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <Element className={classes} data-glass-card-variant={variant} {...props}>
      {children}
    </Element>
  );
}

export const actionButtonVariants = [
  'primary_glow',
  'secondary_outline',
  'ghost',
  'danger',
] as const;
export type ActionButtonVariant = (typeof actionButtonVariants)[number];

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ActionButtonVariant;
  readonly loading?: boolean;
}

const actionButtonVariantClass: Readonly<Record<ActionButtonVariant, string | undefined>> = {
  primary_glow: styles.actionPrimaryGlow,
  secondary_outline: styles.actionSecondaryOutline,
  ghost: styles.actionGhost,
  danger: styles.actionDanger,
};

export function ActionButton({
  variant = 'primary_glow',
  loading = false,
  disabled = false,
  className,
  children,
  type = 'button',
  ...props
}: ActionButtonProps) {
  const classes = [styles.actionButton, actionButtonVariantClass[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      data-action-button-variant={variant}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
    </button>
  );
}

export const statusChipVariants = ['info', 'success', 'warning', 'danger', 'neutral'] as const;
export type StatusChipVariant = (typeof statusChipVariants)[number];

export interface StatusChipProps extends HTMLAttributes<HTMLSpanElement> {
  readonly variant?: StatusChipVariant;
  readonly children: string;
}

const statusChipVariantClass: Readonly<Record<StatusChipVariant, string | undefined>> = {
  info: styles.statusInfo,
  success: styles.statusSuccess,
  warning: styles.statusWarning,
  danger: styles.statusDanger,
  neutral: styles.statusNeutral,
};

export function StatusChip({
  variant = 'neutral',
  className,
  children,
  ...props
}: StatusChipProps) {
  if (children.trim().length === 0) {
    throw new Error('StatusChip requires visible text.');
  }

  const classes = [styles.statusChip, statusChipVariantClass[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} data-status-chip-variant={variant} {...props}>
      <span className={styles.statusMarker} aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
}
