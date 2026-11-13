import assert from "node:assert/strict";
import { test } from "node:test";
import { type ClassPages, pagesFor, parseLoc } from "./class-pages.ts";

test("parseLoc reads single pages, lists and ranges", () => {
  assert.deepEqual(parseLoc("p. 23"), { kind: "page", numbers: [23] });
  assert.deepEqual(parseLoc("pp. 17 and 19"), {
    kind: "page",
    numbers: [17, 19],
  });
  assert.deepEqual(parseLoc("slides 6, 10 and 11"), {
    kind: "slide",
    numbers: [6, 10, 11],
  });
  assert.deepEqual(parseLoc("slides 64 to 67"), {
    kind: "slide",
    numbers: [64, 65, 66, 67],
  });
  assert.deepEqual(parseLoc("Module 02, Q4"), { kind: null, numbers: [] });
});

test("pagesFor returns only published pages of the right kind", () => {
  const pages: ClassPages = {
    "class-dl-m2": {
      kind: "page",
      items: { "23": { src: "/a.webp", width: 900, height: 500 } },
    },
    "class-nlp-m6": { kind: "slide", items: { "5": { text: "Hello" } } },
  };
  assert.deepEqual(pagesFor(pages, "class-dl-m2", "pp. 23 and 24"), [
    { n: 23, src: "/a.webp", width: 900, height: 500 },
  ]);
  assert.deepEqual(pagesFor(pages, "class-dl-m2", "slide 23"), []);
  assert.deepEqual(pagesFor(pages, "class-nlp-m6", "slide 5"), [
    { n: 5, text: "Hello" },
  ]);
  assert.deepEqual(pagesFor(pages, "class-x", "p. 1"), []);
});
