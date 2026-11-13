import Link from "next/link";
import { Fragment } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@/lib/blog-utils";

const text = (n: React.ReactNode): string => (typeof n === "string" || typeof n === "number" ? String(n) : Array.isArray(n) ? n.map(text).join("") : n && typeof n === "object" && "props" in n ? text((n as React.ReactElement<{ children?: React.ReactNode }>).props.children) : "");

const MATH = /(\$[^$\n]+?\$)/g;
/** Công thức $...$ trong văn bản thường: KaTeX (trust=false, không HTML tùy ý). */
const withMath = (c: React.ReactNode): React.ReactNode =>
  Array.isArray(c) ? c.map((x, i) => <Fragment key={i}>{withMath(x)}</Fragment>)
  : typeof c === "string" ? c.split(MATH).map((part, i) => part.length > 2 && part.startsWith("$") && part.endsWith("$")
    ? <span key={i} dangerouslySetInnerHTML={{ __html: katex.renderToString(part.slice(1, -1), { throwOnError: false, trust: false, strict: "ignore" }) }} />
    : part)
  : c;

/** Hiển thị nội dung bài viết (Markdown GFM). Không cho phép HTML thô; liên kết chỉ http(s) hoặc đường dẫn nội bộ. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="article">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        h2: ({ children: c }) => <h2 id={slugify(text(c))} className="mb-3 mt-10 scroll-mt-24 text-2xl font-extrabold leading-snug text-navy">{c}</h2>,
        h3: ({ children: c }) => <h3 id={slugify(text(c))} className="mb-2 mt-6 scroll-mt-24 text-lg font-bold text-navy">{c}</h3>,
        p: ({ children: c }) => <p className="my-4 leading-8 text-slate-700">{withMath(c)}</p>,
        ul: ({ children: c }) => <ul className="my-4 list-disc space-y-2 pl-6 leading-7 text-slate-700 marker:text-brand-text">{c}</ul>,
        ol: ({ children: c }) => <ol className="my-4 list-decimal space-y-2 pl-6 leading-7 text-slate-700 marker:font-bold marker:text-brand-text">{c}</ol>,
        strong: ({ children: c }) => <strong className="font-bold text-ink">{withMath(c)}</strong>,
        em: ({ children: c }) => <em>{withMath(c)}</em>,
        li: ({ children: c }) => <li>{withMath(c)}</li>,
        blockquote: ({ children: c }) => <blockquote className="my-5 rounded-r-xl border-l-4 border-brand bg-brand-soft/60 px-4 py-1 text-slate-700">{c}</blockquote>,
        hr: () => <hr className="my-8 border-slate-200" />,
        table: ({ children: c }) => <div className="my-5 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[32rem] border-collapse text-sm">{c}</table></div>,
        thead: ({ children: c }) => <thead className="bg-mist text-left text-navy">{c}</thead>,
        th: ({ children: c }) => <th className="border-b border-slate-200 px-3 py-2.5 font-bold">{withMath(c)}</th>,
        td: ({ children: c }) => <td className="border-b border-slate-100 px-3 py-2.5 align-top text-slate-700">{withMath(c)}</td>,
        code: ({ children: c }) => <code className="rounded bg-mist px-1.5 py-0.5 text-[0.9em]">{c}</code>,
        a: ({ href, children: c }) => {
          if (href?.startsWith("/") && !href.startsWith("//")) return <Link href={href} className="font-semibold text-brand-text underline-offset-2 hover:underline">{c}</Link>;
          if (href && /^https?:\/\//i.test(href)) return <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-text underline-offset-2 hover:underline">{c}</a>;
          return <span>{c}</span>;
        },
      }}>{children}</ReactMarkdown>
    </div>
  );
}
