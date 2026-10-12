import { BirthForm } from "@/components/BirthForm";

export default function Home() {
  return (
    <>
      <section className="card">
        <h1>평생사주</h1>
        <p className="muted">생년월일시로 사주명식, 오행 분포, 대운 흐름을 계산합니다.</p>
      </section>
      <section className="card">
        <BirthForm />
      </section>
    </>
  );
}
