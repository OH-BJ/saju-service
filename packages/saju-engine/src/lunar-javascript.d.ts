// lunar-javascript 는 타입을 제공하지 않으므로 사용하는 부분만 선언한다.
declare module "lunar-javascript" {
  export interface Solar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    toYmdHms(): string;
  }
  export const Lunar: {
    fromYmd(year: number, month: number, day: number): {
      getJieQiTable(): Record<string, Solar | undefined>;
    };
  };
}
