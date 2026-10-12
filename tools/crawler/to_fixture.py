"""일괄 크롤링 결과(.md)에서 사주명식(간지)만 뽑아 엔진 테스트 fixture(JSON)를 만든다.

해석 문구는 저작물이므로 fixture에 넣지 않는다. 간지 8글자와 입력값만 저장한다.

운신은 천간·지지를 이미지로 표시한다.
  천간: images/star/a1~a10.gif = 甲乙丙丁戊己庚辛壬癸
  지지: images/star/b1~b12.gif = 寅卯辰巳午未申酉戌亥子丑 (寅부터 시작)

사용 예:
    python to_fixture.py inputs/cases.csv
"""
import argparse
import csv
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
STEMS = "甲乙丙丁戊己庚辛壬癸"
BRANCHES = "寅卯辰巳午未申酉戌亥子丑"


def parse_chart(md):
    stems = re.search(r"\| 天干천간 \|(.*)", md)
    branches = re.search(r"\| 地支지지 \|(.*)", md)
    if not stems or not branches:
        return None
    s = [STEMS[int(n) - 1] for n in re.findall(r"/star/a(\d+)\.gif", stems.group(1))]
    b = [BRANCHES[int(n) - 1] for n in re.findall(r"/star/b(\d+)\.gif", branches.group(1))]
    if len(s) != 4 or len(b) != 4:
        return None
    # 표 순서: 생시, 생일, 생월, 생년
    hour, day, month, year = (s[i] + b[i] for i in range(4))
    return {"year": year, "month": month, "day": day, "hour": hour}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("csv")
    p.add_argument("--src", default=str(HERE / "output" / "batch"))
    p.add_argument("--out", default=str(ROOT / "packages/saju-engine/test/fixtures/unsin.json"))
    a = p.parse_args()

    with open(a.csv, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    cases = []
    for row in rows:
        md = Path(a.src) / f"{row['id']}.md"
        if not md.exists():
            continue
        chart = parse_chart(md.read_text(encoding="utf-8"))
        if chart is None:
            print(f"{row['id']}: 명식 파싱 실패")
            continue
        cases.append({
            "id": row["id"],
            "note": row.get("note", ""),
            "input": {k: row[k] for k in ("sex", "birth", "hour", "cal")},
            "expected": chart,
        })

    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(cases, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"fixture {len(cases)}건 저장: {a.out}")


if __name__ == "__main__":
    main()
