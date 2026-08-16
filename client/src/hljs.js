import hljs from "highlight.js/lib/core";

import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import cpp from "highlight.js/lib/languages/cpp";
import c from "highlight.js/lib/languages/c";
import csharp from "highlight.js/lib/languages/csharp";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import kotlin from "highlight.js/lib/languages/kotlin";
import swift from "highlight.js/lib/languages/swift";
import yaml from "highlight.js/lib/languages/yaml";

const langs = { python, sql, java, javascript, typescript, cpp, c, csharp,
  go, rust, bash, json, xml, css, php, ruby, kotlin, swift, yaml };
for (const [name, def] of Object.entries(langs)) hljs.registerLanguage(name, def);

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
}

// Returns highlighted HTML for `code` in `language`, safely escaped.
export function highlightCode(code, language) {
  if (language && language !== "plaintext" && hljs.getLanguage(language)) {
    try { return hljs.highlight(code, { language }).value; } catch { /* fall through */ }
  }
  return escapeHtml(code);
}
