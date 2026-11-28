import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { POLICIES, POLICY_UPDATED, policyBySlug, type PolicyBlock } from "@/content/policies";
import { COMPANY } from "@/lib/company";

export function policyMetadata(slug: string): Metadata {
  const p = policyBySlug(slug);
  return { title: p?.title ?? "Chính sách", description: `${p?.title} của nền tảng CSCA Việt Nam (luyenthicsca.edu.vn), vận hành bởi ${COMPANY.name}.`, alternates: { canonical: `/${slug}` } };
}

function Block({ b }: { b: PolicyBlock }) {
  if (b.t === "h") return <h2 className="mt-7 text-lg font-bold text-navy">{b.text}</h2>;
  if (b.t === "p") return <p className="mt-3">{b.text}</p>;
  if (b.t === "ul") return <ul className="mt-3 list-disc space-y-1.5 pl-5">{b.items.map((x) => <li key={x}>{x}</li>)}</ul>;
  const [head, ...rows] = b.rows;
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[28rem] text-sm">
        <thead className="bg-mist text-left"><tr>{head.map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-slate-100">{r.map((c, j) => <td key={j} className="px-3 py-2 align-top">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/** Trang một văn bản chính sách (công bố theo yêu cầu với website thương mại điện tử). */
export function PolicyPage({ slug }: { slug: string }) {
  const p = policyBySlug(slug);
  if (!p) notFound();
  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <nav aria-label="Các chính sách" className="order-2 lg:order-1">
        <div className="card !p-4 lg:sticky lg:top-24">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Chính sách và điều khoản</p>
          <ul className="space-y-0.5 text-sm">
            {POLICIES.map((x) => (
              <li key={x.slug}><Link href={`/${x.slug}`} aria-current={x.slug === slug ? "page" : undefined} className={`block rounded-lg px-2.5 py-1.5 ${x.slug === slug ? "bg-brand-soft font-semibold text-brand-text" : "text-slate-700 hover:bg-mist"}`}>{x.title}</Link></li>
            ))}
          </ul>
        </div>
      </nav>
      <article className="order-1 min-w-0 lg:order-2">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-text">{COMPANY.name} · luyenthicsca.edu.vn</p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy sm:text-3xl" style={{ textWrap: "balance" }}>{p.title}</h1>
        <p className="mt-2 text-sm text-muted">Cập nhật lần cuối: {POLICY_UPDATED}</p>
        <div className="mt-4 max-w-3xl leading-relaxed text-slate-700">{p.blocks.map((b, i) => <Block key={i} b={b} />)}</div>
        <div className="mt-8 max-w-3xl rounded-xl bg-mist p-4 text-sm text-slate-700">
          <p className="font-semibold text-ink">{COMPANY.name}</p>
          <p>Mã số doanh nghiệp: {COMPANY.taxCode} · Địa chỉ: {COMPANY.address}</p>
          <p>Điện thoại/Zalo: <a href={`tel:${COMPANY.phoneHref}`} className="font-semibold text-brand-text">{COMPANY.phone}</a> · Email: <span className="font-semibold">{COMPANY.email}</span> · Hỗ trợ {COMPANY.hours}</p>
        </div>
      </article>
    </div>
  );
}
