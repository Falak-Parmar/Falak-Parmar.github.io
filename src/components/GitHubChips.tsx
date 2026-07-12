"use client";

import { useEffect, useState } from "react";

interface GitHubStats {
  repos: number;
  stars: number;
  followers: number;
  topLanguages: string[];
  streak: {
    current: number;
    longest: number;
    totalThisYear: number;
  };
  graphqlOk: boolean;
}

export default function GitHubChips() {
  const [stats, setStats] = useState<GitHubStats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("https://api.github.com/users/Falak-Parmar"),
      fetch("https://api.github.com/users/Falak-Parmar/repos?per_page=100&type=owner")
    ])
      .then(async ([userRes, reposRes]) => {
        if (!userRes.ok || !reposRes.ok) return;
        const user = await userRes.json();
        const repos = await reposRes.json();

        const totalStars = repos.reduce(
          (sum: number, r: any) => sum + (r.fork ? 0 : r.stargazers_count),
          0
        );

        const languageCounts: Record<string, number> = {};
        repos.forEach((r: any) => {
          if (r.language && !r.fork) {
            languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
          }
        });

        const topLanguages = Object.entries(languageCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([lang]) => lang);

        setStats({
          repos: user.public_repos,
          stars: totalStars,
          followers: user.followers,
          topLanguages,
          streak: { current: 0, longest: 0, totalThisYear: 0 },
          graphqlOk: false
        });
      })
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <a
      href="https://github.com/Falak-Parmar"
      className="github-chips-row"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub profile"
    >
      {/* Repos */}
      <span className="gh-chip" title={`${stats.repos} repositories`}>
        <span className="material-symbols-rounded gh-chip-icon">folder</span>
        <span className="gh-chip-value">{stats.repos}</span>
        <span className="gh-chip-label">Repos</span>
      </span>

      {/* Stars */}
      <span className="gh-chip" title={`${stats.stars} stars`}>
        <span className="material-symbols-rounded gh-chip-icon">star</span>
        <span className="gh-chip-value">{stats.stars}</span>
        <span className="gh-chip-label">Stars</span>
      </span>

      {/* Followers */}
      <span className="gh-chip" title={`${stats.followers} followers`}>
        <span className="material-symbols-rounded gh-chip-icon">group</span>
        <span className="gh-chip-value">{stats.followers}</span>
        <span className="gh-chip-label">Followers</span>
      </span>

      {/* Languages */}
      {stats.topLanguages.length > 0 && (
        <span className="gh-chip gh-chip-langs">
          <span className="material-symbols-rounded gh-chip-icon">code</span>
          <span className="gh-langs-inner">
            {stats.topLanguages.map((lang) => (
              <span key={lang} className="gh-lang-tag">{lang}</span>
            ))}
          </span>
        </span>
      )}
    </a>
  );
}
