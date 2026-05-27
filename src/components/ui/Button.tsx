import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 disabled:border-indigo-300 disabled:bg-indigo-300",
  secondary:
    "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 disabled:text-slate-400",
  ghost:
    "border border-transparent bg-transparent text-indigo-700 hover:bg-indigo-50 disabled:text-indigo-300",
  danger:
    "border border-red-600 bg-red-600 text-white hover:bg-red-700 disabled:border-red-300 disabled:bg-red-300",
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
