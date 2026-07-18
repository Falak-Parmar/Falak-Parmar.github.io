"use client";

import React, { useEffect, useState } from "react";
import "@/styles/index/release-feed.css";

interface Commit {
  id: string;
  repo: string;
  message: string;
  date: string;
  timestamp: number;
  url: string;
}

const getFallbackCommits = (): Commit[] => {
  const baseTime = new Date("2026-07-12T12:00:00Z").getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: "a4f89d2",
      repo: "LoFa-De_CTG",
      message: "feat: evaluate neural fallacy classification models on CoCoLoFa validation set",
      date: "Jul 11, 2026",
      timestamp: baseTime - 1 * dayMs,
      url: "https://github.com/Falak-Parmar/LoFa-De_CTG"
    },
    {
      id: "e5d66d7",
      repo: "LoFa-De_CTG",
      message: "docs: add requirements and dependencies in README markdown",
      date: "Jul 10, 2026",
      timestamp: baseTime - 2 * dayMs,
      url: "https://github.com/Falak-Parmar/LoFa-De_CTG"
    },
    {
      id: "b1f8c3d",
      repo: "LoFa-De_CTG",
      message: "refactor: adjust temperature parameter and testing prompts for CTG",
      date: "Jul 09, 2026",
      timestamp: baseTime - 3 * dayMs,
      url: "https://github.com/Falak-Parmar/LoFa-De_CTG"
    },
    {
      id: "d4e2f90",
      repo: "LoFa-De_CTG",
      message: "fix: resolve cuda out of memory error during training batch iteration",
      date: "Jul 07, 2026",
      timestamp: baseTime - 5 * dayMs,
      url: "https://github.com/Falak-Parmar/LoFa-De_CTG"
    }
  ];
};

export default function ReleaseSection() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommits() {
      let fetchedCommits: Commit[] = [];
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneWeekAgoMs = oneWeekAgo.getTime();

      try {
        const headers: Record<string, string> = {
          Accept: "application/vnd.github+json",
        };

        // Fetch public events first
        const res = await fetch("https://api.github.com/users/Falak-Parmar/events", {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            for (const event of data) {
              const eventTime = new Date(event.created_at).getTime();
              
              if (eventTime >= oneWeekAgoMs && event.type === "PushEvent" && event.payload?.commits) {
                for (const c of event.payload.commits) {
                  fetchedCommits.push({
                    id: c.sha.slice(0, 7),
                    repo: event.repo.name.replace("Falak-Parmar/", ""),
                    message: c.message,
                    date: new Date(event.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                    timestamp: eventTime,
                    url: `https://github.com/${event.repo.name}/commit/${c.sha}`,
                  });
                }
              }
            }
          }
        }

        // Also fetch repository commits directly for LoFa-De_CTG (active repo)
        const repoCommitsRes = await fetch("https://api.github.com/repos/Falak-Parmar/LoFa-De_CTG/commits", {
          headers,
        });

        if (repoCommitsRes.ok) {
          const repoCommits = await repoCommitsRes.json();
          if (Array.isArray(repoCommits)) {
            for (const c of repoCommits) {
              const commitTime = new Date(c.commit.committer.date).getTime();
              if (commitTime >= oneWeekAgoMs) {
                if (!fetchedCommits.some((existing) => existing.id === c.sha.slice(0, 7))) {
                  fetchedCommits.push({
                    id: c.sha.slice(0, 7),
                    repo: "LoFa-De_CTG",
                    message: c.commit.message,
                    date: new Date(c.commit.committer.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                    timestamp: commitTime,
                    url: `https://github.com/Falak-Parmar/LoFa-De_CTG/commit/${c.sha}`,
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch GitHub commits, using fallback", err);
      }

      // If no live commits from the past week, use fallback commits
      if (fetchedCommits.length === 0) {
        fetchedCommits = getFallbackCommits();
      }

      fetchedCommits.sort((a, b) => b.timestamp - a.timestamp);
      setCommits(fetchedCommits.slice(0, 8));
      setLoading(false);
    }

    fetchCommits();
  }, []);

  if (loading) {
    return (
      <div className="release-feed-wrapper">
        <div className="release-feed-scroll no-scrollbar" style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1.5rem" }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="release-card skeleton"
              style={{
                minWidth: "260px",
                maxWidth: "260px",
                height: "135px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                opacity: 0.3
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="release-feed-wrapper page-loaded">
      <div className="release-feed-scroll no-scrollbar" style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1.5rem" }}>
        {commits.map((commit, index) => (
          <a
            key={`${commit.id}-${index}`}
            href={commit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="release-card revealed"
            style={{ minWidth: "260px", maxWidth: "260px", textDecoration: "none", textAlign: "left" }}
          >
            <div className="release-card-body" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span className="release-app-tag" style={{ background: "var(--primary-color)", color: "#ffffff", padding: "0.2rem 0.5rem", borderRadius: "8px", fontSize: "0.75rem", display: "inline-block", marginBottom: "0.5rem" }}>
                  {commit.repo}
                </span>
                <h3 className="release-card-title" style={{ fontSize: "0.95rem", margin: "0.5rem 0", lineHeight: "1.3", color: "var(--text-color)" }}>
                  {commit.message}
                </h3>
              </div>
              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span className="release-card-date" style={{ fontSize: "0.75rem", opacity: 0.6 }}>{commit.date}</span>
                <span style={{ fontSize: "0.7rem", fontFamily: "monospace", opacity: 0.5, marginLeft: "auto", background: "var(--background-color-secondary)", padding: "2px 6px", borderRadius: "4px" }}>
                  {commit.id}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
