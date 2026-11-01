import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Hiển thị văn bản có công thức LaTeX: $...$ (inline) và $$...$$ (khối).
 * KaTeX chạy với trust=false và throwOnError=false: không thực thi HTML tùy ý; phần còn lại là text thuần.
 */
export function Rich({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return (
    <span className={`whitespace-pre-wrap ${className ?? ""}`}>
      {parts.map((p, i) => {
        const block = p.startsWith("$$") && p.endsWith("$$") && p.length > 4;
        const inline = !block && p.startsWith("$") && p.endsWith("$") && p.length > 2;
        if (!block && !inline) return <span key={i}>{p}</span>;
        const html = katex.renderToString(p.slice(block ? 2 : 1, block ? -2 : -1), { displayMode: block, throwOnError: false, trust: false, strict: "ignore" });
        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </span>
  );
}
