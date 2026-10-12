import type { ReadingSection } from "@saju/interpretation";

/** 섹션별 해석 본문. 빈 줄로 구분된 문단을 <p>로 나눈다. */
export function ReadingSections({ sections }: { sections: ReadingSection[] }) {
  return (
    <>
      {sections.map((s) => (
        <section className="card reading" key={s.key}>
          <h2>{s.title}</h2>
          {s.body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </section>
      ))}
    </>
  );
}
