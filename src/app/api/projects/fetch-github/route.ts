import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { parseGitHubUrl, isValidGitHubRepoUrl, FetchGitHubRepoResponse } from '@/types/projects';

/**
 * POST /api/projects/fetch-github
 * Fetch repository data from GitHub to auto-populate project fields
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { githubUrl } = body;

    if (!githubUrl || typeof githubUrl !== 'string') {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    // Validate GitHub URL format
    if (!isValidGitHubRepoUrl(githubUrl)) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL. Format: https://github.com/owner/repo' },
        { status: 400 }
      );
    }

    // Parse owner and repo from URL
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Failed to parse GitHub URL' },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    // Fetch repository data from GitHub API
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'StackPass-DevCard',
      },
      // Don't use auth token for public repos to avoid rate limit issues
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Repository not found or is private' },
          { status: 404 }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch repository data from GitHub' },
        { status: response.status }
      );
    }

    const repoData = await response.json();

    // Extract tech stack from topics and language
    const suggestedTechStack: string[] = [];

    // Add primary language if available
    if (repoData.language) {
      suggestedTechStack.push(repoData.language);
    }

    // Add topics (GitHub's topics are like tags)
    if (repoData.topics && Array.isArray(repoData.topics)) {
      // Take first 5 topics
      suggestedTechStack.push(...repoData.topics.slice(0, 5));
    }

    // Build response
    const result: FetchGitHubRepoResponse = {
      success: true,
      data: {
        title: repoData.name || '',
        description: repoData.description || '',
        githubUrl: repoData.html_url,
        stars: repoData.stargazers_count || 0,
        forks: repoData.forks_count || 0,
        language: repoData.language || undefined,
        suggestedTechStack: [...new Set(suggestedTechStack)], // Remove duplicates
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching GitHub repository:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository data' },
      { status: 500 }
    );
  }
}
