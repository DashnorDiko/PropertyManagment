import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-[var(--pm-accent)] bg-[var(--pm-accent)] text-white hover:border-[var(--pm-accent-strong)] hover:bg-[var(--pm-accent-strong)] disabled:border-[var(--pm-surface-muted)] disabled:bg-[var(--pm-surface-muted)] disabled:text-[var(--pm-text-secondary)]",
  secondary:
    "border border-[var(--pm-border)] bg-[var(--pm-surface)] text-[var(--pm-text-primary)] hover:bg-[var(--pm-surface-soft)] disabled:text-[var(--pm-text-secondary)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--pm-info-strong)] hover:bg-[var(--pm-info-soft)] disabled:text-[var(--pm-text-secondary)]",
  danger:
    "border border-[var(--pm-danger-strong)] bg-[var(--pm-danger-strong)] text-white hover:bg-[#7f120a] disabled:border-[var(--pm-danger-soft)] disabled:bg-[var(--pm-danger-soft)] disabled:text-[var(--pm-danger-strong)]",
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const composedClassName = [
    "rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={composedClassName} {...props} />;
}
