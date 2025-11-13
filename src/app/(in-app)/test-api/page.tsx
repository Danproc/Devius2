'use client';

import { useState } from 'react';

export default function TestProjectsAPI() {
  const [results, setResults] = useState<{ [key: string]: any }>({});

  const displayResult = (key: string, data: any) => {
    setResults((prev) => ({ ...prev, [key]: data }));
  };

  const getProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      displayResult('get', data);
    } catch (error: any) {
      displayResult('get', { error: error.message });
    }
  };

  const fetchGitHubData = async () => {
    const githubUrl = 'https://github.com/vercel/next.js';
    try {
      const response = await fetch('/api/projects/fetch-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl }),
      });
      const data = await response.json();
      displayResult('fetch-github', data);
    } catch (error: any) {
      displayResult('fetch-github', { error: error.message });
    }
  };

  const createProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Next.js Framework',
          description: 'The React Framework for Production',
          projectUrl: 'https://nextjs.org',
          githubUrl: 'https://github.com/vercel/next.js',
          techStack: ['React', 'TypeScript', 'JavaScript'],
        }),
      });
      const data = await response.json();
      displayResult('create', data);
    } catch (error: any) {
      displayResult('create', { error: error.message });
    }
  };

  const getDevCard = async () => {
    try {
      const response = await fetch('/api/cards/me');
      const data = await response.json();
      displayResult('devcard', data);
    } catch (error: any) {
      displayResult('devcard', { error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🧪 Projects API Testing Tool</h1>
        <p className="text-gray-400 mb-8">Test the custom projects backend endpoints</p>

        {/* GET Projects */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">1. GET /api/projects</h2>
          <button
            onClick={getProjects}
            className="bg-green-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-green-400 transition"
          >
            Fetch All Projects
          </button>
          {results.get && (
            <pre className="mt-4 bg-black border border-zinc-800 rounded p-4 overflow-x-auto text-sm">
              {JSON.stringify(results.get, null, 2)}
            </pre>
          )}
        </div>

        {/* Fetch GitHub Data */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">
            2. POST /api/projects/fetch-github
          </h2>
          <p className="text-gray-400 mb-4">Testing with: https://github.com/vercel/next.js</p>
          <button
            onClick={fetchGitHubData}
            className="bg-green-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-green-400 transition"
          >
            Auto-Fetch GitHub Data
          </button>
          {results['fetch-github'] && (
            <pre className="mt-4 bg-black border border-zinc-800 rounded p-4 overflow-x-auto text-sm">
              {JSON.stringify(results['fetch-github'], null, 2)}
            </pre>
          )}
        </div>

        {/* Create Project */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">3. POST /api/projects</h2>
          <p className="text-gray-400 mb-4">
            Creates a project with pre-filled Next.js data
          </p>
          <button
            onClick={createProject}
            className="bg-green-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-green-400 transition"
          >
            Create Project
          </button>
          {results.create && (
            <pre className="mt-4 bg-black border border-zinc-800 rounded p-4 overflow-x-auto text-sm">
              {JSON.stringify(results.create, null, 2)}
            </pre>
          )}
        </div>

        {/* Check DevCard */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">4. GET /api/cards/me</h2>
          <p className="text-gray-400 mb-4">
            Check DevCard response (should include custom_projects field)
          </p>
          <button
            onClick={getDevCard}
            className="bg-green-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-green-400 transition"
          >
            Check DevCard
          </button>
          {results.devcard && (
            <pre className="mt-4 bg-black border border-zinc-800 rounded p-4 overflow-x-auto text-sm max-h-96">
              {JSON.stringify(results.devcard, null, 2)}
            </pre>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-950 border border-blue-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-400 mb-3">📋 Testing Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Click "Fetch All Projects" - should return empty array initially</li>
            <li>Click "Auto-Fetch GitHub Data" - should return Next.js repo data</li>
            <li>Click "Create Project" - creates a new project</li>
            <li>Click "Fetch All Projects" again - should show your created project</li>
            <li>Click "Check DevCard" - verify custom_projects field exists</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
