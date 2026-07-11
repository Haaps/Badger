import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "destructive" | "icon";

export type ButtonPreviewState = "hover";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: ButtonVariant;
  /** Renders a leading icon. Pass `true` for the default plus icon. */
  icon?: ReactNode | boolean;
  loading?: boolean;
  previewState?: ButtonPreviewState;
  children?: ReactNode;
};
