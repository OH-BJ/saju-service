/** 돌 인장 육면체. 바닥면은 인주색. size·height로 크기를 바꾼다 */
export function Seal3D({ size = 46, height = 60, className = "", style }: { size?: number; height?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`seal3d ${className}`} style={{ ["--w" as string]: `${size}px`, ["--h" as string]: `${height}px`, ...style }} aria-hidden="true">
      <i className="bt" />
      <i className="bk" />
      <i className="lf" />
      <i className="rt" />
      <i className="fr" />
      <i className="top" />
    </div>
  );
}
