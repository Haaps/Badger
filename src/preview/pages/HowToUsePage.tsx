/**
 * Gallery-only integration guide UI. User-facing copy lives here; keep aligned with
 * usageSnippets.ts (per-component code) and catalog.ts (routes) when adding components.
 */
import styles from "./HowToUsePage.module.css";

export function HowToUsePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>How to Use</h2>
        <p className={styles.lead}>
          This gallery previews Badger components in isolation and in composed
          flows. Copy component folders into your platform — do not copy{" "}
          <code>src/preview/</code>.
        </p>
      </header>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>What to copy</h3>
        <p className={styles.sectionText}>
          Each component lives in its own folder under{" "}
          <code>src/components/</code> with TypeScript, CSS Modules, and embedded
          icon components. Also copy <code>src/tokens/</code> (or import{" "}
          <code>src/tokens/global.css</code> once in your app).
        </p>
        <pre className={styles.codeBlock}>{`src/
├── tokens/
│   └── global.css          ← import once at app root
└── components/
    ├── Button/
    ├── Checkbox/
    │   └── icons/            ← embedded SVG React components
    ├── SummaryPanel/       ← may depend on other folders
    └── …`}</pre>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Icons</h3>
        <p className={styles.sectionText}>
          Icons are embedded as inline React components in each component&apos;s{" "}
          <code>icons/</code> folder — not separate <code>.svg</code> asset
          files. Copy the whole component folder (including <code>icons/</code>)
          into your app. No SVG loader or URL import configuration is required.
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Checkbox, Radio, Switch, SingleSelect, SummaryPanel</strong>{" "}
            — icons live alongside the component.
          </li>
          <li>
            <strong>FilterBar</strong> and <strong>DataTable</strong> — copy{" "}
            <code>FilterBar/icons/</code> for status chip icons (DataTable
            reuses <code>StatusIcon</code>).
          </li>
          <li>
            <strong>StackedBarChart</strong> — legend icons are in{" "}
            <code>StackedBarChart/icons/</code>.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Target app requirements</h3>
        <ul className={styles.list}>
          <li>React 18+</li>
          <li>CSS Modules support (<code>*.module.css</code>)</li>
          <li>
            Inter font loaded globally, or override{" "}
            <code>--typography-font-family</code> in your theme
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Using this gallery</h3>
        <ul className={styles.list}>
          <li>
            Browse components in the left nav. Each page shows a live preview
            and an <strong>Integration code</strong> section at the bottom.
          </li>
          <li>
            Use <strong>Design Tokens</strong> to inspect colors, spacing,
            typography, and CSS variable names.
          </li>
          <li>
            Composite demos (Summary Panel, Data Table) show multi-step
            workflows — stage, update, approve — not just static UI.
          </li>
          <li>
            Summary Panel has six gallery pages — list, text, boolean, date,
            date/time, numeric, gaps, overlaps, and duplicates — each with its own error-type controls
            where applicable.
          </li>
          <li>
            Interactive controls on a page (Reset, error-type switchers) are for
            the gallery only.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Integrating a component</h3>
        <ol className={styles.list}>
          <li>
            Open the component page and scroll to <strong>Integration code</strong>.
          </li>
          <li>
            Copy the listed folders into your project. Composite components list
            all transitive dependencies (e.g. Summary Panel includes Radio,
            Button, MultiSelectMenu, etc.).
          </li>
          <li>
            Import the component and pass props from your platform data — cell
            values, error counts, option lists, callbacks.
          </li>
          <li>
            Wire callbacks (<code>onChange</code>, <code>onPanelStateChange</code>,{" "}
            <code>onClose</code>) to your app state and API layer.
          </li>
        </ol>
        <pre className={styles.codeBlock}>{`import { SummaryPanel } from "@/components/SummaryPanel";

<SummaryPanel
  validationType="boolean"
  errorType="invalid-value"
  invalidValue={cellValue}
  cellCount={errorStats.cellCount}
  holeCount={errorStats.holeCount}
  booleanValueOptions={column.booleanOptions}
  holeOptions={holeOptions}
  onPanelStateChange={handlePanelStateChange}
  onClose={handleClose}
/>`}</pre>
        <div className={styles.callout}>
          <span className={styles.calloutStrong}>Pass domain data explicitly.</span>{" "}
          Summary Panel accepts demo fallbacks when props are omitted so this
          gallery works out of the box. In your platform, supply real values —
          especially dynamic option lists like <code>booleanValueOptions</code>,{" "}
          <code>valueOptions</code>, and <code>holeOptions</code>.
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Summary Panel validation types</h3>
        <p className={styles.sectionText}>
          Summary Panel corrects validation errors through a shared
          editable → staged → approved workflow. Set{" "}
          <code>validationType</code> and <code>errorType</code> to match the
          column being edited.
        </p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>validationType</th>
              <th>errorType</th>
              <th>Resolution UI</th>
              <th>Key props from your platform</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>list</code>
              </td>
              <td>
                <code>invalid-value</code>, <code>missing-value</code>
              </td>
              <td>Single select (+ optional custom value)</td>
              <td>
                <code>valueOptions</code>, <code>invalidValue</code>, counts
              </td>
            </tr>
            <tr>
              <td>
                <code>text</code>
              </td>
              <td>
                <code>exceeded-character-limit</code>,{" "}
                <code>value-required</code>
              </td>
              <td>Trim / increase limit, or text area</td>
              <td>
                <code>characterLimit</code>,{" "}
                <code>exceededLimitCellText</code>, counts
              </td>
            </tr>
            <tr>
              <td>
                <code>boolean</code>
              </td>
              <td>
                <code>invalid-value</code>, <code>missing-value</code>
              </td>
              <td>Radio group (“Choose a value”)</td>
              <td>
                <code>booleanValueOptions</code> (dynamic labels/values), counts
              </td>
            </tr>
            <tr>
              <td>
                <code>date</code>
              </td>
              <td>
                <code>invalid-value</code>, <code>missing-value</code>
              </td>
              <td>
                Text field labeled “Date” with required format in brackets;
                invalid input shows field error
              </td>
              <td>
                <code>dateFormat</code> (from column schema),{" "}
                <code>invalidValue</code>, counts
              </td>
            </tr>
            <tr>
              <td>
                <code>date-time</code>
              </td>
              <td>
                <code>invalid-value</code>, <code>missing-value</code>
              </td>
              <td>
                Text field labeled “Date Time” with required format in brackets;
                invalid input shows field error
              </td>
              <td>
                <code>dateTimeFormat</code> (from column schema),{" "}
                <code>invalidValue</code>, counts
              </td>
            </tr>
            <tr>
              <td>
                <code>numeric</code>
              </td>
              <td>
                <code>exceeded-decimal-limit</code>,{" "}
                <code>exceeded-decimal-below-min</code>,{" "}
                <code>exceeded-decimal-above-max</code>, <code>missing-value</code>,{" "}
                <code>invalid-value</code>, <code>below-min-value</code>,{" "}
                <code>above-max-value</code>
              </td>
              <td>
                Round / increase decimal limit / manual value; dual errors use a
                single validated value field
              </td>
              <td>
                <code>decimalMax</code>, <code>minValue</code>,{" "}
                <code>maxValue</code>, <code>invalidValue</code>, counts
              </td>
            </tr>
            <tr>
              <td>
                <code>gaps</code>
              </td>
              <td>
                <code>gaps-not-allowed</code>
              </td>
              <td>
                Single “Adjust To/From Value” field for the selected cell;
                current gap banner when applicable; pass column header labels via{" "}
                <code>toLabel</code> and <code>fromLabel</code>
              </td>
              <td>
                <code>toValue</code>, <code>fromValue</code>,{" "}
                <code>toLabel</code>, <code>fromLabel</code>,{" "}
                <code>gapsSelectedField</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>overlaps</code>
              </td>
              <td>
                <code>overlaps-not-allowed</code>
              </td>
              <td>
                Same single-field edit UI as gaps with a current overlap banner;
                values must meet exactly to remove the overlap
              </td>
              <td>
                <code>toValue</code>, <code>fromValue</code>,{" "}
                <code>toLabel</code>, <code>fromLabel</code>,{" "}
                <code>gapsSelectedField</code>, <code>intervalCrossValidation</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>duplicates</code>
              </td>
              <td>
                <code>duplicates-not-allowed</code>
              </td>
              <td>
                Delete this row or edit one column manually;{" "}
                <code>cellCount</code> is the number of duplicate rows
              </td>
              <td>
                <code>toValue</code>, <code>fromValue</code>,{" "}
                <code>toLabel</code>, <code>fromLabel</code>,{" "}
                <code>gapsSelectedField</code>, row count
              </td>
            </tr>
          </tbody>
        </table>
        <p className={styles.sectionText}>
          <code>onPanelStateChange</code> fires when the user stages, updates, or
          approves. It receives the staged <code>value</code> string (not the
          display label), apply scope, and selected drill holes. Use{" "}
          <code>getApplyImpact</code> when footer row/hole counts should reflect
          real selection data.
        </p>
        <p className={styles.sectionText}>
          For side-by-side table layouts, pass <code>fillHeight</code> so the
          panel stretches to the parent height. Otherwise set{" "}
          <code>panelHeight</code> (defaults to 640px).
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Data Table + Summary Panel</h3>
        <p className={styles.sectionText}>
          <code>DataTableWithSummary</code> is a composed gallery demo: a table
          beside a Summary Panel with <code>fillHeight</code>, controlled
          collapse, and <code>getApplyImpact</code> wired to row data. The demo
          data uses <strong>list validation only</strong> — it does not pass{" "}
          <code>validationType</code> for text or boolean columns.
        </p>
        <p className={styles.sectionText}>
          In your platform, drive <code>validationType</code>,{" "}
          <code>errorType</code>, and type-specific props from each column
          definition when a cell is selected — the same pattern as the three
          Summary Panel gallery pages.
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Component dependencies</h3>
        <p className={styles.sectionText}>
          Atomic components (Button, Radio, Checkbox) are self-contained.
          Higher-level components compose them:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Checkbox, Radio, Switch</strong> — self-contained with{" "}
            <code>icons/</code>
          </li>
          <li>
            <strong>FilterBar</strong> → <code>icons/</code> (status chips)
          </li>
          <li>
            <strong>StackedBarChart</strong> → <code>icons/</code> (legend)
          </li>
          <li>
            <strong>SingleSelect</strong> → SelectMenu, Checkbox
          </li>
          <li>
            <strong>MultiSelectMenu</strong> → SelectMenu, Checkbox
          </li>
          <li>
            <strong>SummaryPanel</strong> → Button, Radio, SegmentedControl,
            SingleSelect, TextField, TextAreaField, MultiSelectMenu,{" "}
            <code>icons/</code>
          </li>
          <li>
            <strong>DataTable</strong> (with summary) → DataTable, SummaryPanel,
            FilterBar <code>icons/</code>, and transitive Summary Panel
            dependencies
          </li>
        </ul>
        <p className={styles.sectionText}>
          The Integration code block on each gallery page lists exactly which
          folders to copy for that component.
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Controlled vs uncontrolled props</h3>
        <ul className={styles.list}>
          <li>
            <strong>Form controls</strong> (Checkbox, Radio, Switch, inputs):
            pass <code>value</code>/<code>checked</code> and{" "}
            <code>onChange</code> from parent state.
          </li>
          <li>
            <strong>Summary Panel collapse</strong>: use{" "}
            <code>collapsed</code> + <code>onCollapsedChange</code> for
            controlled mode, or <code>defaultCollapsed</code> for
            uncontrolled.
          </li>
          <li>
            <strong>Summary Panel workflow</strong>: panel state (editable /
            staged / approved) is internal unless you react via{" "}
            <code>onPanelStateChange</code> or open with{" "}
            <code>defaultPanelState</code> / <code>initialStagedValue</code>.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Gallery-only props and demo data</h3>
        <p className={styles.sectionText}>
          Some components expose <code>previewState</code> on Button, TextField,
          and TextAreaField for static design previews. Do not use these in
          production — they override interaction for the gallery.
        </p>
        <p className={styles.sectionText}>
          Summary Panel and Data Table fall back to built-in demo constants when
          props are omitted so the gallery works without wiring. Do not rely on
          those defaults in production — pass real cell values, counts, and
          option lists. Demo constants exported from{" "}
          <code>SummaryPanel.demoData</code> are for gallery pages only.
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Keeping this guide up to date</h3>
        <p className={styles.sectionText}>
          When you add or change a component in this repo, update integration
          docs in the same change:
        </p>
        <ol className={styles.list}>
          <li>
            <strong>This page</strong> (<code>HowToUsePage.tsx</code>) — target
            app requirements, validation types, dependencies, icons, layout
            props, or integration patterns.
          </li>
          <li>
            <strong>Integration code</strong> (<code>usageSnippets.ts</code> +
            <code>UsageCodePanel</code> on the gallery page) — files to copy,
            requirements, and example code for that component.
          </li>
          <li>
            <strong>README.md</strong> — repo-level handoff notes and quick-start
            examples when they change.
          </li>
          <li>
            <strong>catalog.ts</strong> — new gallery routes (e.g. new Summary
            Panel validation pages).
          </li>
        </ol>
      </section>
    </div>
  );
}
