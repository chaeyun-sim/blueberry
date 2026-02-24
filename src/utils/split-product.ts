/**
 * 상품명을 곡명과 편성명으로 분리합니다.
 * 마지막 '-' 기준으로 분리합니다.
 *
 * 예) "베토벤-소나타-SOLO(Vc,Pf)"               → { song: "베토벤-소나타", arrangement: "SOLO(Vc,Pf)" }
 *     "시대를 초월한 마음 (OST)-QUARTET(Vn,Vc)"  → { song: "시대를 초월한 마음 (OST)", arrangement: "QUARTET(Vn,Vc)" }
 */
export function splitProduct(product: string): { song: string; arrangement: string } {
  const lastDash = product.lastIndexOf('-');
  if (lastDash === -1) return { song: product, arrangement: '' };
  return {
    song: product.slice(0, lastDash).trim(),
    arrangement: product.slice(lastDash + 1).trim(),
  };
}
