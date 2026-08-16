import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { LANGUAGES } from "../languages.js";
import { highlightCode } from "../hljs.js";

/**
 * A self-contained code editor: a syntax-highlighted <pre> sits behind a
 * transparent <textarea>, so you see live highlighting while typing.
 * The language picker is shown only while the box is focused (clicked).
 * Controlled via { code, language } + onChange.
 */
export default function CodeBox({ code, language, onChange, onFocus }) {
  const preRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const syncScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target;
      const { selectionStart: s, selectionEnd: end } = el;
      const next = (code || "").slice(0, s) + "  " + (code || "").slice(end);
      onChange({ code: next, language });
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2; });
    }
  };

  // Trailing newline keeps the highlighted layer height in step with the textarea.
  const html = highlightCode((code || "") + "\n", language);

  return (
    <div className="codebox">
      <div className="codebox__bar">
        <select
          className="codebox__lang"
          value={language}
          onChange={(e) => onChange({ code, language: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
        <button className="codebox__copy" type="button" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="codebox__area">
        <pre ref={preRef} aria-hidden="true" className="codebox__pre">
          <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
        <textarea
          className="codebox__ta"
          value={code || ""}
          spellCheck={false}
          wrap="off"
          placeholder="Type or paste code…"
          onChange={(e) => onChange({ code: e.target.value, language })}
          onScroll={syncScroll}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
