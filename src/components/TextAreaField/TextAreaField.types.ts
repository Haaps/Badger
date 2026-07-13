import type { TextareaHTMLAttributes, ReactNode } from "react";

export type TextAreaFieldPreviewState = "focus";

export type TextAreaFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "maxLength"
> & {
  /** Optional label shown above the field. */
  label?: ReactNode;
  /** Maximum number of characters the user can enter. */
  maxLength: number;
  /** Show the character counter in the label row. Defaults to true. */
  showCharacterCount?: boolean;
  error?: boolean;
  errorMessage?: ReactNode;
  /** Gallery-only visual state. */
  previewState?: TextAreaFieldPreviewState;
};
