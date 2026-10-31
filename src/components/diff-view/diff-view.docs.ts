import type { ComponentDoc } from "../../docs-model";

const SAMPLE = `diff --git a/agents/ideas.py b/agents/ideas.py
index 2468b67..b9744f6 100644
--- a/agents/ideas.py
+++ b/agents/ideas.py
@@ -10,7 +10,8 @@ def analyse(batch):
     commits = batch.commits
-    ideas = critic(commits)
+    ideas = critic(commits)
+    ideas = calibrate(ideas, model="local")
     return confirm(ideas)
 
 
@@ -40,3 +41,3 @@ def score(idea):
-    return idea.confidence
+    return round(idea.confidence)
 
diff --git a/docs/ideas.md b/docs/ideas.md
new file mode 100644
--- /dev/null
+++ b/docs/ideas.md
@@ -0,0 +1,2 @@
+# Ideas
+Watched repos, analysed in batches.
`;

export const diffViewDoc: ComponentDoc = {
  id: "diff-view",
  title: "Diff View",
  description:
    "A unified diff, read-only: one block per file with its path, `+N −M` and a fold button, then its hunks with old and new line numbers and the added and removed lines coloured (and signed, for whoever cannot see the colour). Takes the diff as text (`git diff`, `format-patch`, `diff -u`) or as files already parsed. A page that does more with a line — comment on it — puts its button in `#line-actions` and its comment in `#line-after`; the diff stays the same one everywhere. Hunks off screen are not laid out, so a 2000-line diff opens without stalling.",
  imports: ["UiDiffView", "UiButton"],
  api: [
    { name: "diff", type: "string", default: "''", description: "A unified diff as text. Parsed with `parseUnifiedDiff` (exported)." },
    { name: "files", type: "DiffFile[] | null", default: "null", description: "Files already parsed: `{ file, subject?, binary?, hunks: [{ header, lines: [{ kind: 'add'|'del'|'ctx', old, new, text }] }] }`. Wins over `diff`." },
    { name: "collapsed", type: "boolean", default: "false", description: "Start with every file folded. A new diff starts from this again." },
    { name: "lineNumbers", type: "boolean", default: "true", description: "Show the old and new line numbers." },
    { name: "label", type: "string", default: "'Diff'", description: "Accessible name of the diff region." },
    { name: "emptyText", type: "string", default: "'No changes'", description: "Shown when there are no files." },
    { name: "binaryText", type: "string", default: "'Binary file'", description: "Shown inside a binary file." },
    { name: "@toggled", type: "(file: DiffFile, open: boolean) => void", default: "—", description: "A file was folded or unfolded." },
    { name: "#line-actions", type: "slot { file, hunk, line }", default: "—", description: "At the end of a line; shown on hover or focus (always on touch screens)." },
    { name: "#line-after", type: "slot { file, hunk, line }", default: "—", description: "Under a line, full width: a comment, an editor." },
    { name: "#file-actions", type: "slot { file }", default: "—", description: "In the file header, after the stats." },
    { name: "#empty", type: "slot", default: "emptyText", description: "Replaces the empty text." },
  ],
  demos: [
    {
      title: "Two files from text",
      code: `<UiDiffView :diff="diff" label="Diff of the batch" />`,
      setup: () => ({ diff: SAMPLE }),
    },
    {
      title: "A line slot for comments",
      description: "The page owns the comment; the diff only gives it a place on the line and under it.",
      code: `<UiDiffView :diff="diff" collapsed>
  <template #line-actions="{ file, line }">
    <UiButton v-if="line.new != null" size="sm" variant="text" @clicked="note = file.file + ':' + line.new">comment</UiButton>
  </template>
  <template #line-after="{ file, line }">
    <div v-if="note === file.file + ':' + line.new" style="padding: 4px 8px; border-left: 2px solid var(--ui-color-primary)">Comment on {{ note }}</div>
  </template>
</UiDiffView>`,
      setup: () => ({ diff: SAMPLE, note: "" }),
    },
    {
      title: "Empty",
      code: `<UiDiffView diff="" empty-text="The package has no patches" />`,
    },
  ],
};
