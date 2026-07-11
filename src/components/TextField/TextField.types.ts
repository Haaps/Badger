import type { InputHTMLAttributes, ReactNode } from "react";

export type TextFieldPreviewState = "focus";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Optional label shown above the field. */
  label?: ReactNode;
  /** Optional action link shown opposite the label. Omit when not needed. */
  linkText?: ReactNode;
  /** URL when the link renders as an anchor. Use with `linkText`. */
  linkHref?: string;
  /** Click handler when the link renders as a button. Use with `linkText`. */
  onLinkClick?: () => void;
  error?: boolean;
  errorMessage?: ReactNode;
  /** Gallery-only visual state. */
  previewState?: TextFieldPreviewState;
};
