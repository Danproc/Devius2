/**
 * Validation helpers for StackPass Hackathons
 */

/**
 * Validate GitHub repository URL format
 */
export function isValidGitHubUrl(url: string): boolean {
  const githubUrlRegex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
  return githubUrlRegex.test(url);
}

/**
 * Validate demo URL format
 */
export function isValidDemoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate hackathon slug format
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
}

/**
 * Validate team size (1-5 members)
 */
export function isValidTeamSize(memberCount: number): boolean {
  return memberCount >= 1 && memberCount <= 5;
}

/**
 * Validate tech stack array
 */
export function isValidTechStack(techStack: string[]): boolean {
  if (!Array.isArray(techStack)) return false;
  if (techStack.length < 1 || techStack.length > 10) return false;
  return techStack.every(tag =>
    typeof tag === 'string' &&
    tag.length >= 2 &&
    tag.length <= 30
  );
}

/**
 * Validate project title
 */
export function isValidProjectTitle(title: string): boolean {
  return title.length >= 3 && title.length <= 100;
}

/**
 * Validate project description
 */
export function isValidDescription(description: string): boolean {
  return description.length >= 10 && description.length <= 5000;
}

/**
 * Check if current time is before deadline
 */
export function isBeforeDeadline(deadline: Date): boolean {
  return new Date() < deadline;
}

/**
 * Check if voting period is active
 */
export function isVotingPeriodActive(votingStart: Date | null, votingEnd: Date | null): boolean {
  if (!votingStart || !votingEnd) return false;
  const now = new Date();
  return now >= votingStart && now <= votingEnd;
}

/**
 * Validate date order for hackathon
 */
export function isValidHackathonDates(
  startAt: Date,
  submissionDeadline: Date,
  votingStart?: Date | null,
  votingEnd?: Date | null
): { valid: boolean; error?: string } {
  if (submissionDeadline <= startAt) {
    return { valid: false, error: 'Submission deadline must be after start date' };
  }

  if (votingStart && votingStart < submissionDeadline) {
    return { valid: false, error: 'Voting start must be at or after submission deadline' };
  }

  if (votingEnd && votingStart && votingEnd <= votingStart) {
    return { valid: false, error: 'Voting end must be after voting start' };
  }

  return { valid: true };
}
