#!/usr/bin/env python3
"""Chuyển các bài SEO (.docx trong content/seo) thành content/seo/posts.json bằng pandoc.
   Tách khối "Thành phần SEO" (title, meta, đường dẫn, từ khóa) khỏi nội dung bài.
   Chạy: python3 scripts/seo_docx_to_json.py"""
import glob, json, os, re, subprocess, sys

SRC = os.path.join(os.path.dirname(__file__), "..", "content", "seo")
CAT = {1: "Thông tin kỳ thi", 2: "Thông tin kỳ thi", 3: "Thông tin kỳ thi", 4: "Thông tin kỳ thi", 5: "Thông tin kỳ thi",
       6: "Toán", 7: "Toán", 13: "Toán", 8: "Thông tin kỳ thi", 9: "Thông tin kỳ thi", 10: "Thông tin kỳ thi",
       11: "Vật lý", 12: "Vật lý", 14: "Kỹ năng thi", 15: "Kỹ năng thi", 16: "Hóa học", 21: "Tiếng Trung chuyên ngành"}

def cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]

posts = []
for f in sorted(glob.glob(os.path.join(SRC, "*.docx"))):
    md = subprocess.run(["pandoc", "-f", "docx", "-t", "gfm", "--wrap=none", f], capture_output=True, text=True, check=True).stdout
    lines = md.split("\n")
    # H1
    h1 = next(l[2:].strip() for l in lines if l.startswith("# "))
    # lịch đăng
    sched = next((l for l in lines if l.startswith("**Lịch đăng:**")), "")
    m_no = re.search(r"Bài số (\d+)/60", sched); m_dt = re.search(r"(\d{2})/(\d{2})/(\d{4})", sched)
    m_path = re.search(r"Đường dẫn(?: đề xuất)?:\s*(\S+)", sched)
    # khối SEO: bảng đầu tiên
    meta = {}
    i0 = next(i for i, l in enumerate(lines) if l.startswith("| **Thành phần SEO**"))
    i = i0 + 2
    while i < len(lines) and lines[i].startswith("|"):
        c = cells(lines[i]); meta[c[0]] = c[1] if len(c) > 1 else ""; i += 1
    # nội dung: bỏ H1, dòng lịch đăng và bảng SEO
    body_lines = [l for idx, l in enumerate(lines) if not (idx < i and (l.startswith("# ") or l.startswith("**Lịch đăng:**") or idx >= i0))]
    body = "\n".join(body_lines).strip() + "\n"
    body = re.sub(r"\n{3,}", "\n\n", body)
    # liên kết có khoảng trắng trong địa chỉ
    body = re.sub(r"\]\((https?://[^)]*?)\)", lambda m: "](" + m.group(1).replace(" ", "%20") + ")", body)
    path = (meta.get("Đường dẫn") or (m_path.group(1) if m_path else "")).strip()
    slug = path.split("/blog/")[1] if path.startswith("/blog/") else re.sub(r"^T\d+-\d+-\d+_", "", os.path.basename(f)[:-5]).replace("_", "-")
    no = int(m_no.group(1)) if m_no else None
    words = len(re.sub(r"[|#*\-]", " ", body).split())
    posts.append({
        "slug": slug, "title": h1, "seo_title": meta.get("Thẻ tiêu đề (title)", h1), "meta_description": meta.get("Mô tả meta", ""),
        "keyword": meta.get("Từ khóa chính", ""), "keywords": [k.strip() for k in meta.get("Từ khóa phụ", "").split(",") if k.strip()],
        "category": CAT.get(no or 0, "Thông tin kỳ thi"), "body_md": body, "planned_no": no,
        "planned_for": f"{m_dt.group(3)}-{m_dt.group(2)}-{m_dt.group(1)}" if m_dt else None,
        "replaces_path": path if path and not path.startswith("/blog/") else None,
        "source_file": os.path.basename(f), "read_minutes": max(1, round(words / 200)),
    })
posts.sort(key=lambda p: p["planned_no"] or 999)
out = os.path.join(SRC, "posts.json")
json.dump(posts, open(out, "w"), ensure_ascii=False, indent=1)
print(f"Đã ghi {len(posts)} bài → {out}")
for p in posts: print(f"{p['planned_no']:>2} {p['planned_for']} {p['slug'][:36]:<36} {p['category']:<24} {p['read_minutes']}′  title={len(p['seo_title'])}c meta={len(p['meta_description'])}c")
