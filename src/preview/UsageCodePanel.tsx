import { useCallback, useState } from "react";
import styles from "./UsageCodePanel.module.css";

type UsageCodePanelProps = {
  title?: string;
  description?: string;
  filesToCopy: string;
  requirements: string[];
  code: string;
};

export function UsageCodePanel({
  title = "Integration code",
  description = "Copy this into your app after adding the component folder.",
  filesToCopy,
  requirements,
  code,
}: UsageCodePanelProps) {
  const [copied, setCopied] = useState(false);

  const fullSnippet = [
    `// ${filesToCopy}`,
    "",
    ...requirements.map((item) => `// Requires: ${item}`),
    "",
    code.trim(),
  ].join("\n");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullSnippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [fullSnippet]);

  return (
    <section className={styles.panel} aria-label={title}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
        <button type="button" className={styles.copyButton} onClick={handleCopy}>
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>

      <p className={styles.files}>{filesToCopy}</p>

      <ul className={styles.requirements}>
        {requirements.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <pre className={styles.codeBlock}>
        <code>{code.trim()}</code>
      </pre>
    </section>
  );
}
