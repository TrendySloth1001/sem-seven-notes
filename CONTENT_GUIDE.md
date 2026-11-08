# Writing notes and solutions

Audience: a student who knows only the basics. They should be able to follow every line and connect it to what they already know.

## Layout

```
content/<subject>/
  references.json          shared citable sources (https URLs only, checked to resolve)
  references/<topic>.json  sources added while writing one topic (keeps parallel writers apart)
  topics.json              the topic list; questions are tagged with these slugs
  notes/<topic>.mdx        one detailed note per topic
  pyq/<paper>/paper.json   the paper: questions verbatim, marks, topic tags, source PDF
  pyq/<paper>/<q>.mdx      one solution per question (missing file = "Solution pending")
  notes/<topic>.hi.mdx     Hinglish version of a note (optional; the site falls back to English)
  pyq/<paper>/<q>.hi.mdx   Hinglish version of a solution
```

Run `pnpm validate` after any content change. It checks reference ids, `<PYQ>` ids, topic tags and the solution rules below.

## Style (applies to every note and solution)

**Theory first, math only when required.** MU papers are mostly "Explain", "Describe", "Differentiate" and "Comment on" questions, so the answer is mainly words: what it is, why it is needed, how it works step by step, a labelled diagram, advantages and disadvantages, applications, and comparisons. Use a formula only when the question asks for it (derive, calculate, "with equations"), when the syllabus names it, or when one short formula makes the idea clearer than words. Never let a formula replace an explanation; explain it in words first, then show it. Numeric examples are for calculation questions and the few formulas you keep.

A good theory answer follows this order (skip parts the question does not need):

1. Definition in one or two simple sentences.
2. Why it is needed: the problem it solves.
3. How it works: numbered steps or a short walk through the diagram.
4. Diagram with labels.
5. Types or variants, if the question asks.
6. Advantages and disadvantages (or limitations).
7. Applications or a real-world example.
8. Comparison table when two things are being contrasted.
9. One-line conclusion.

10. **Basics first.** A note opens with the few ideas the reader needs (what a weight, loss, epoch is) before the new topic.
11. **Simplest words.** Short sentences. Define every term the first time it appears. Say what each symbol in a formula means.
12. **One everyday analogy** per hard idea (for example the student who memorizes the paper).
13. **A tiny worked example with real numbers** for each formula you keep and for every calculation question. Work it by hand and check it.
14. **Sums (calculation questions) are solved step by step and verified,** inside a `<Sum>` block so they render as a labelled card:

    ```mdx
    <Sum>

    <Given>

    $w = 2$, learning rate $\eta = 0.1$, gradient $= 4$.

    </Given>

    <Find>

    the new weight.

    </Find>

    <Steps>

    1. Step size $= \eta \times$ gradient $= 0.1 \times 4 = 0.4$. *Reason: the step is the learning rate times the slope.*
    2. Move downhill: $2 - 0.4 = 1.6$.

    </Steps>

    <Answer>

    new $w = 1.6$

    </Answer>

    <Box kind="verify">

    Plug back in: $1.6 + 0.4 = 2$, the starting weight.

    </Box>

    </Sum>
    ```

    Each step does one operation and says why. The check verifies the answer a different way (plug it back in, recompute in another order, check the range or sign, or a known case). Keep the blank lines inside the tags. Recompute every number yourself before writing it. `node scripts/wrap-sums.ts --write <files>` converts the older plain "**Given:** / **To find:** / steps / **Answer:**" pattern.
15. **Solutions start with "In simple words:"**, then give the exam-ready structure: definition, steps or diagram, formula, example, conclusion. About 100 to 150 words for 5 marks and 250 to 350 for 10 marks.
16. **Be correct before simple.** Do not overclaim (for example L1 reaches "zero or extremely near zero", not always exactly zero). If a point is debated, say so.
17. **No decorative UI in content.** Use plain lists, tables and the `<Box>` component only.

## Hinglish versions

Every note and solution can have a Hinglish copy next to it (`<name>.hi.mdx`). A toggle in the app bar switches between the two. Hinglish is for understanding; the student still writes the exam in English, so keep exam phrases and every technical term in English.

- **Roman script only** (no Devanagari). Hindi sentence structure with English technical terms, the way a teacher explains in class: "Overfitting tab hota hai jab model training data ko ratta maar leta hai, aur naye data pe fail ho jaata hai."
- **Same content, same order, same facts** as the English file: the same diagrams, `<Cite>`, `<PYQ>`, `<Syl>` and `<Box>` components, the same numbers and the same frontmatter `references`. It is a translation of the explanation, not a new answer. Formulas and table headers stay as in English; table cells and mermaid labels may be Hinglish if short.
- Notes: translate `summary` and `keyIdeas` in the frontmatter too; headings may be Hinglish ("Ye kyun zaroori hai").
- Keep it simple and natural; avoid heavy Hindi words (use "important", not "mahatvapurn"). Define terms the same way as the English file.
- Add one short line where useful: "Exam mein English mein likho: …" with the exact English sentence to write.

## Diagrams

Every note needs **at least two diagrams**. A 10-mark solution about an architecture, a process or a curve needs **one**. Draw only what helps understanding; label everything in plain words. Wrap every diagram in a caption that says what to notice.

- `<Figure caption="What to notice.">…</Figure>` wraps one or more diagrams side by side.
- `<CurvePlot curves="sigmoid,tanh" x="-6,6" y="-1.2,1.2" xLabel="x" yLabel="output" />` plots named curves. Available: `sigmoid`, `tanh`, `relu`, `leaky-relu`, `softplus`, `step`, `linear`, `sigmoid-derivative`, `tanh-derivative`, `train-error`, `val-error`, `mse-loss`, `ce-loss` (the last two take the predicted probability p in 0..1 for a true label of 1). `mark="min:val-error"` draws a line at that curve's minimum.
- `<NetworkFigure layers="3,4,2" title="…" labels="Input,Hidden,Output" dropped="1:0" />` draws a fully connected network. `dropped="layer:index"` (0-based) crosses out neurons.
- `<NormBalls />` is the L1-versus-L2 picture (regularization only).
- Flowcharts, architectures, timelines: a fenced ` ```mermaid ` block whose **first line is** `%% caption: …`. Quote every label (`A["Conv 3×3"]`), keep it under about 12 nodes, use `flowchart LR` for pipelines and `TD` for loops. No `;` and no unquoted brackets inside labels.
- Need a curve or picture that does not exist? Do not edit `src/`. Use a mermaid diagram or a table instead and say what is missing in your summary.

### Diagrams from the internet

Look at how the best sites draw the topic before you draw it: search GeeksforGeeks, Javatpoint, TutorialsPoint, Medium, Analytics Vidhya, IBM, vendor docs and Wikipedia for the clearest diagram of the idea. Then use it in one of two ways:

1. **Redraw it as our own diagram, and link the original.** Images on GfG, Medium, Javatpoint and most sites are copyrighted, so never copy or hotlink them. Redraw the same idea as a mermaid diagram (the idea and standard layout are free to use; the drawing is not), and put a chip to the page right under it: `<Cite id="gfg-sdlc" loc="diagram" />`. The student can click through to see the original.
2. **Embed a real image only from Wikimedia Commons, with an accepted licence.** Use this for things mermaid cannot draw (photos, real screenshots, detailed architecture figures):
   - Find the file on commons.wikimedia.org. Get its metadata: `curl -s -A "sem-study-site/1.0" "https://commons.wikimedia.org/w/api.php?action=query&titles=File:<Name>&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1200&format=json"`.
   - `license` must be one of: Public domain, CC0, CC BY 2.0/2.5/3.0/4.0, CC BY-SA 2.0/2.5/3.0/4.0 (exact spelling, e.g. `CC BY-SA 4.0`). Anything else (including "Fair use") is not allowed.
   - `src` is `thumburl` with the query string removed and the host set to `upload.wikimedia.org` (PNG or JPEG only; for SVG files use the PNG thumbnail). `width`/`height` are `thumbwidth`/`thumbheight`. `author` is the Artist field as plain text. `sourceUrl` is `descriptionurl`. `licenseUrl` is LicenseUrl if present. `alt` describes what the image shows.
   - Add the record to `content/<subject>/images/<your-key>.json` (ids start with your key), then place it: `<Img id="<id>" caption="What to notice." />`. The page shows the author and licence under it automatically. Use the same `<Img>` in the Hinglish copy, with a Hinglish caption.
   - Check the image is relevant and readable at phone width (no tiny text); at most two embedded images per note.

## Citations

- Every source is a chip. Use `<Cite id="..." loc="§7.1.1" />` in text and list ids in the frontmatter `references`.
- Only cite what you have opened. Check every new URL with `node scripts/check-urls.ts <file.json>` and keep only those that print `ok` with a matching title.
- Cite **both** kinds of source:
  - primary: the Goodfellow chapter for the topic and the original paper of each method;
  - popular study sites a student actually uses: **GeeksforGeeks**, **W3Schools** (only where it has a page on the topic), **Dive into Deep Learning (d2l.ai)**, **Keras / PyTorch docs**, **Wikipedia**, and where good pages exist **TutorialsPoint, Javatpoint, Analytics Vidhya, MachineLearningMastery, IBM, NPTEL**.
    Aim for 15 to 30 sources per note, and at least one popular site in every solution's `references`.
- Popular sites sometimes disagree with the primary sources (for example on dropout scaling). Write what the primary source says; cite the tutorial as further reading.
- Put new sources in `content/<subject>/references/<your-topic>.json` (an array like references.json). Reuse ids that already exist instead of duplicating them. New ids start with the site and include your topic, for example `gfg-cnn-pooling`, `d2l-cnn-padding`, `wiki-lstm`. Kinds: `book`, `paper`, `course`, `notes`, `tutorial` (popular sites), `docs`, `wiki`. `short` is the chip text, for example `GeeksforGeeks · Pooling`.
- Link to a section (`loc`) only when you have confirmed the section number.
- Link past papers with `<PYQ id="2024-05/q1c" />` and the syllabus with `<Syl m="2" />`.

## Solution files

- No headings (`#`) inside a solution. Several solutions share one page, so repeated headings would create duplicate anchors. Use bold lead-ins.
- Frontmatter is only `references: [id, ...]`.
- A repeated question still gets its own full solution file.
