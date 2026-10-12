"""unsin.co.kr 평생사주(saju/total) 결과를 Firecrawl로 크롤링한다.

결과 페이지는 입력 폼(POST)을 거쳐야 내용이 채워지므로,
Firecrawl actions로 폼 페이지에서 값을 채우고 제출한 뒤 결과를 받아온다.

사용 예:
    python crawl_saju.py --name 홍길동 --sex 남 --birth 1990-01-01 --hour 0 --cal S_C
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path

import urllib.request

FORM_URL = "https://www.unsin.co.kr/unse/saju/total/form"
API_URL = "https://api.firecrawl.dev/v2/scrape"
HOURS = ["0", "01", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"]


def load_api_key():
    # 스크립트 위치에서 상위로 올라가며 .env를 찾는다 (프로젝트 루트의 .env 사용)
    for d in Path(__file__).resolve().parents:
        env = d / ".env"
        if env.exists():
            for line in env.read_text(encoding="utf-8").splitlines():
                if line.startswith("FIRECRAWL_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"')
    return os.environ["FIRECRAWL_API_KEY"]


def build_script(a):
    y, m, d = a.birth.split("-")
    values = {
        "user_name": a.name,
        "sex": a.sex,
        "birth_yyyy": y,
        "birth_mm": m.zfill(2),
        "birth_dd": d.zfill(2),
        "birth_hh": a.hour,
        "birth_solunar": a.cal,
    }
    return (
        f"var v={json.dumps(values, ensure_ascii=False)};"
        "for(var k in v){var el=document.getElementById(k);"
        "if(el.tagName==='SELECT'&&![...el.options].some(o=>o.value===v[k]))"
        "{var o=document.createElement('option');o.value=v[k];el.appendChild(o);}"
        "el.value=v[k];}"
        "document.getElementById('frm').submit();"
    )


def scrape(api_key, script):
    body = {
        "url": FORM_URL,
        "formats": ["markdown", "html"],
        "onlyMainContent": False,
        "actions": [
            {"type": "wait", "milliseconds": 1500},
            {"type": "executeJavascript", "script": script},
            {"type": "wait", "milliseconds": 4000},
        ],
    }
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(body).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.load(r)


def extract(markdown):
    """'## 제목' 단위로 결과 섹션을 나눈다 (평생사주 ~ 재테크운)."""
    start = markdown.find("## 평생사주")
    end = markdown.find("- 카카오", start)
    body = markdown[start:end if end > 0 else None]
    sections = {}
    for block in re.split(r"\n(?=## )", body):
        title, _, text = block.partition("\n")
        sections[title.lstrip("# ").strip()] = text.strip()
    return sections


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--name", required=True)
    p.add_argument("--sex", choices=["남", "여"], required=True)
    p.add_argument("--birth", required=True, help="YYYY-MM-DD")
    p.add_argument("--hour", choices=HOURS, default="0", help="태어난 시 코드 (0=모름, 01=子 ...)")
    p.add_argument("--cal", choices=["S_C", "L_C", "L_L"], default="S_C", help="양력/음력평달/음력윤달")
    p.add_argument("--out", default=str(Path(__file__).with_name("output")))
    a = p.parse_args()

    res = scrape(load_api_key(), build_script(a))
    if not res.get("success"):
        sys.exit(f"Firecrawl 오류: {res}")
    data = res["data"]

    out = Path(a.out)
    out.mkdir(exist_ok=True)
    stem = f"saju_{a.name}_{a.birth}"
    (out / f"{stem}.md").write_text(data.get("markdown", ""), encoding="utf-8")
    (out / f"{stem}.html").write_text(data.get("html", ""), encoding="utf-8")
    sections = extract(data.get("markdown", ""))
    (out / f"{stem}.json").write_text(
        json.dumps({"input": vars(a), "url": data.get("metadata", {}).get("url"), "sections": sections},
                   ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"저장 완료: {out / stem}.(md|html|json)  섹션 {len(sections)}개")


if __name__ == "__main__":
    main()
