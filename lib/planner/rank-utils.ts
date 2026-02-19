
export const RANK_STEP = BigInt(1024);
export const RANK_PAD = 18;

export const parseRank = (value: string | null | undefined): bigint | null => {
  if (!value) return null;
  if (!/^\d+$/.test(value)) return null;

  try {
    return BigInt(value);
  } catch {
    return null;
  }
};

export const rankToString = (value: bigint): string => value.toString().padStart(RANK_PAD, '0');

export const rankBetween = (previous: string | null, next: string | null): string => {
  const prevNum = parseRank(previous);
  const nextNum = parseRank(next);

  if (prevNum !== null && nextNum !== null) {
    if (nextNum - prevNum > BigInt(1)) {
      return rankToString(prevNum + (nextNum - prevNum) / BigInt(2));
    }

    return rankToString(nextNum + RANK_STEP);
  }

  if (prevNum !== null) {
    return rankToString(prevNum + RANK_STEP);
  }

  if (nextNum !== null) {
    return rankToString(nextNum > BigInt(1) ? nextNum / BigInt(2) : BigInt(1));
  }

  const epochMicros = BigInt(Math.floor(Date.now() * 1000));
  return rankToString(epochMicros);
};
