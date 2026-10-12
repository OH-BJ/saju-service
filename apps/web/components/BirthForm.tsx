import { BASE_PATH } from "@/lib/basePath";

/** 생년월일시 입력 폼. JS 없이 동작하도록 GET 제출 → /saju/result */
export function BirthForm() {
  return (
    <form className="form" action={`${BASE_PATH}/saju/result/`} method="get">
      <label>
        이름
        <input name="name" maxLength={20} placeholder="이름 (선택)" />
      </label>

      <label>
        성별
        <span className="radio">
          <span><input type="radio" name="gender" value="male" defaultChecked /> 남자</span>
          <span><input type="radio" name="gender" value="female" /> 여자</span>
        </span>
      </label>

      <label>
        생년월일
        <span className="row">
          <input name="year" type="number" min={1900} max={2050} placeholder="년 (1990)" required />
          <input name="month" type="number" min={1} max={12} placeholder="월" required />
          <input name="day" type="number" min={1} max={31} placeholder="일" required />
        </span>
      </label>

      <label>
        양력/음력
        <select name="calendar" defaultValue="solar">
          <option value="solar">양력</option>
          <option value="lunar">음력 (평달)</option>
          <option value="lunar-leap">음력 (윤달)</option>
        </select>
      </label>

      <label>
        태어난 시각
        <input name="time" type="time" />
        <span className="muted">모르면 비워두세요. 시주 없이 계산합니다.</span>
      </label>

      <button type="submit">사주 보기</button>
    </form>
  );
}
