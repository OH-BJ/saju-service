"""CSV의 입력 목록을 일괄 크롤링한다. 이미 받은 케이스는 건너뛴다.

사용 예:
    python batch.py inputs/cases.csv
CSV 컬럼: id,name,sex,birth,hour,cal
"""
import argparse
import csv
import time
from pathlib import Path
from types import SimpleNamespace

from crawl_saju import build_script, load_api_key, scrape

HERE = Path(__file__).parent


def main():
    p = argparse.ArgumentParser()
    p.add_argument("csv")
    p.add_argument("--out", default=str(HERE / "output" / "batch"))
    p.add_argument("--delay", type=float, default=3.0, help="요청 사이 대기(초)")
    a = p.parse_args()

    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    key = load_api_key()
    with open(a.csv, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    for i, row in enumerate(rows, 1):
        dest = out / f"{row['id']}.md"
        if dest.exists():
            print(f"[{i}/{len(rows)}] {row['id']} 건너뜀 (이미 있음)")
            continue
        try:
            res = scrape(key, build_script(SimpleNamespace(**row)))
        except Exception as e:  # 한 건 실패해도 나머지는 계속
            print(f"[{i}/{len(rows)}] {row['id']} 실패: {e}")
            continue
        if not res.get("success"):
            print(f"[{i}/{len(rows)}] {row['id']} 실패: {res.get('error')}")
            continue
        dest.write_text(res["data"].get("markdown", ""), encoding="utf-8")
        print(f"[{i}/{len(rows)}] {row['id']} 완료")
        time.sleep(a.delay)


if __name__ == "__main__":
    main()
