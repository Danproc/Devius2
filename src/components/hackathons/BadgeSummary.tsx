interface BadgeSummaryProps {
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
}

/**
 * BadgeSummary component for wallet pass
 * Displays a compact summary of hackathon achievements
 */
export function BadgeSummary({ firstPlace, secondPlace, thirdPlace }: BadgeSummaryProps) {
  const total = firstPlace + secondPlace + thirdPlace;

  if (total === 0) {
    return null;
  }

  const parts: string[] = [];
  if (firstPlace > 0) parts.push(`🥇${firstPlace}`);
  if (secondPlace > 0) parts.push(`🥈${secondPlace}`);
  if (thirdPlace > 0) parts.push(`🥉${thirdPlace}`);

  return (
    <div className="text-sm text-devcard-text">
      <span className="font-semibold text-devcard-heading">Hackathon Wins: </span>
      {parts.join(' • ')}
    </div>
  );
}

/**
 * Format badge summary for wallet pass auxiliary field
 * Returns a compact string like "🥇2 🥈1 🥉1"
 */
export function formatBadgeSummaryForWallet(
  firstPlace: number,
  secondPlace: number,
  thirdPlace: number
): string {
  const total = firstPlace + secondPlace + thirdPlace;

  if (total === 0) {
    return '';
  }

  const parts: string[] = [];
  if (firstPlace > 0) parts.push(`🥇${firstPlace}`);
  if (secondPlace > 0) parts.push(`🥈${secondPlace}`);
  if (thirdPlace > 0) parts.push(`🥉${thirdPlace}`);

  return parts.join(' ');
}
