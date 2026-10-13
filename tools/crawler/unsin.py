"""운신(unsin.co.kr) 운세 결과 페이지를 Firecrawl로 수집한다.

결과 페이지는 입력 폼(POST)을 거쳐야 채워지므로 Firecrawl actions로 폼 값을 채우고 제출한다.
수집 목적은 메뉴 구성·섹션 구조 조사와 만세력 검증용 간지 비교이며,
해석 문구는 저작물이므로 output/ 밖으로 내보내거나 서비스 문구로 쓰지 않는다.

사용 예:
    python unsin.py saju    --name 홍길동 --sex 남 --birth 1990-01-01 --hour 14
    python unsin.py tojung  --name 홍길동 --sex 남 --birth 1990-01-01 --year 2027
    python unsin.py gunghap --name 홍길동 --sex 남 --birth 1990-01-01 \
                            --partner 성춘향,여,1992-05-05,10,S_C
    python unsin.py today   --name 홍길동 --sex 남 --birth 1990-01-01
"""
import argparse
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

API_URL = "https://api.firecrawl.dev/v2/scrape"
BASE = "https://www.unsin.co.kr/unse"
SERVICES = {
    "saju": f"{BASE}/saju/total/form",
    "tojung": f"{BASE}/tojung/total/form",
    "gunghap": f"{BASE}/gunghap/sintong/form",
    "today": f"{BASE}/free/todayline/form?linenum=01&sid=tunse",
}
# 폼의 시 코드: 0=모름, 01=子(23:30~), 02=丑 ... 22=亥
HOURS = ["0", "01", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"]
HERE = Path(__file__).parent


def load_api_key():
    for d in Path(__file__).resolve().parents:
        env = d / ".env"
        if env.exists():
            for line in env.read_text(encoding="utf-8").splitlines():
                if line.startswith("FIRECRAWL_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"')
    return os.environ["FIRECRAWL_API_KEY"]


def person_fields(prefix, name, sex, birth, hour, cal):
    y, m, d = birth.split("-")
    return {
        f"{prefix}name" if prefix else "user_name": name,
        f"{prefix}sex": sex,
        f"{prefix}birth_yyyy": y,
        f"{prefix}birth_mm": m.zfill(2),
        f"{prefix}birth_dd": d.zfill(2),
        f"{prefix}birth_hh": hour,
        f"{prefix}birth_solunar": cal,
    }


def build_values(a):
    values = person_fields("", a.name, a.sex, a.birth, a.hour, a.cal)
    if a.service == "tojung":
        values["target_yyyy"] = str(a.year)
    if a.service == "gunghap":
        name, sex, birth, hour, cal = a.partner.split(",")
        values.update(person_fields("your_", name, sex, birth, hour, cal))
    return values


def build_script(values):
    # select에 값이 없으면 option을 추가하고, 라디오는 같은 name 중 value가 맞는 것을 체크한다
    return (
        f"var v={json.dumps(values, ensure_ascii=False)};"
        "for(var k in v){var els=document.getElementsByName(k);var el=document.getElementById(k)||els[0];"
        "if(!el)continue;"
        "if(el.type==='radio'){for(var r of els){r.checked=(r.value===v[k]);}continue;}"
        "if(el.tagName==='SELECT'&&![...el.options].some(o=>o.value===v[k]))"
        "{var o=document.createElement('option');o.value=v[k];el.appendChild(o);}"
        "el.value=v[k];}"
        "document.getElementById('frm').submit();"
    )


def scrape(api_key, url, script):
    body = {
        "url": url,
        "formats": ["markdown", "html"],
        "onlyMainContent": False,
        "actions": [
            {"type": "wait", "milliseconds": 1500},
            {"type": "executeJavascript", "script": script},
            {"type": "wait", "milliseconds": 5000},
        ],
    }
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(body).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=240) as r:
        return json.load(r)


def outline(markdown):
    """섹션 제목과 분량만 뽑는다 (구조 조사용, 본문은 담지 않음)."""
    rows = []
    for m in re.finditer(r"^(#{2,4}) (.+)$", markdown, re.M):
        start = m.end()
        nxt = re.search(r"^#{2,4} ", markdown[start:], re.M)
        body = markdown[start:start + nxt.start()] if nxt else markdown[start:start + 3000]
        rows.append({"level": len(m.group(1)), "title": m.group(2).strip(), "chars": len(body.strip())})
    return rows


def main():
    p = argparse.ArgumentParser()
    p.add_argument("service", choices=SERVICES)
    p.add_argument("--id", help="저장 파일 이름 (기본: 서비스_이름_생일)")
    p.add_argument("--name", required=True)
    p.add_argument("--sex", choices=["남", "여"], required=True)
    p.add_argument("--birth", required=True, help="YYYY-MM-DD")
    p.add_argument("--hour", choices=HOURS, default="0")
    p.add_argument("--cal", choices=["S_C", "L_C", "L_L"], default="S_C", help="양력/음력평달/음력윤달")
    p.add_argument("--year", type=int, default=2027, help="토정비결 대상 연도")
    p.add_argument("--partner", help="궁합 상대: 이름,성별,YYYY-MM-DD,시코드,달력")
    p.add_argument("--out", default=str(HERE / "output"))
    a = p.parse_args()
    if a.service == "gunghap" and not a.partner:
        p.error("궁합은 --partner가 필요합니다")

    res = scrape(load_api_key(), SERVICES[a.service], build_script(build_values(a)))
    if not res.get("success"):
        sys.exit(f"Firecrawl 오류: {res}")
    data = res["data"]
    md = data.get("markdown", "")

    out = Path(a.out) / a.service
    out.mkdir(parents=True, exist_ok=True)
    stem = a.id or f"{a.name}_{a.birth}"
    (out / f"{stem}.md").write_text(md, encoding="utf-8")
    (out / f"{stem}.html").write_text(data.get("html", ""), encoding="utf-8")
    (out / f"{stem}.outline.json").write_text(
        json.dumps({"input": vars(a), "url": data.get("metadata", {}).get("url"), "outline": outline(md)},
                   ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"저장: {out / stem}.(md|html|outline.json)  제목 {len(outline(md))}개")


if __name__ == "__main__":
    main()
