"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Navbar from "@/components/Navbar";
import SocialsChips from "@/components/SocialsChips";
import { GitHubCalendar } from "react-github-calendar";
import GitHubChips from "@/components/GitHubChips";

import "@/styles/index/highlights.css";
import "@/styles/index/github-stats.css";

interface Activity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface HomeClientProps {
  updatesSection: React.ReactNode;
  wallpaperData?: any;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function HomeClient({
  updatesSection,
  wallpaperData,
}: HomeClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [bgUrl, setBgUrl] = useState(`${basePath}/assets/img/clouds.png`);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [projectDetails, setProjectDetails] = useState<Record<string, { stars: number; downloads: number; latestReleaseAt: string }> | null>(null);

  useEffect(() => {
    fetch("/project-details.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setProjectDetails(data);
      })
      .catch(() => {});
  }, []);

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${diffYears}y ago`;
  };

  const renderProjectStats = (key: string) => {
    if (!projectDetails || !projectDetails[key]) return null;
    const detail = projectDetails[key];
    if (detail.stars === 0 && detail.downloads === 0 && !detail.latestReleaseAt) return null;

    return (
      <div className="highlight-stats">
        {detail.stars > 0 && (
          <span className="highlight-stat-badge" title={`${detail.stars} stars`}>
            <span className="material-symbols-rounded">star</span>
            <span>{formatCount(detail.stars)}</span>
          </span>
        )}
        {detail.downloads > 0 && (
          <span className="highlight-stat-badge" title={`${detail.downloads} downloads`}>
            <span className="material-symbols-rounded">download</span>
            <span>{formatCount(detail.downloads)}</span>
          </span>
        )}
        {detail.latestReleaseAt && (
          <span className="highlight-stat-badge" title={`Last release: ${new Date(detail.latestReleaseAt).toLocaleString()}`}>
            <span className="material-symbols-rounded">schedule</span>
            <span>{timeAgo(detail.latestReleaseAt)}</span>
          </span>
        )}
      </div>
    );
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as any).toString(),
      });
      if (response.ok) {
        setFormStatus("success");
        form.reset();
      } else {
        setFormStatus("error");
      }
    } catch (error) {
      setFormStatus("error");
    }
  };

  // Helper to get lower quality/size Unsplash URL for performance
  const getOptimizedUrl = (url: string, width: number, quality: number) => {
    if (!url) return "";
    return url
      .replace(/&w=\d+/, `&w=${width}`)
      .replace(/&q=\d+/, `&q=${quality}`);
  };

  useEffect(() => {
    setBgUrl(`${basePath}/assets/img/clouds.png`);
    const img = new Image();
    img.src = `${basePath}/assets/img/clouds.png`;
    img.onload = () => {
      setBgLoaded(true);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll(".item") as NodeListOf<HTMLElement>;
    let i = 0;

    const animate = () => {
      if (i < items.length) {
        items[i].style.opacity = "1";
        items[i].style.transform = "translateY(0)";
        i++;
        setTimeout(animate, 150);
      }
    };

    const scrollToEnd = () => {
      if (calendarRef.current) {
        calendarRef.current.scrollLeft = calendarRef.current.scrollWidth;
        const inner = calendarRef.current.querySelector("div");
        if (inner) {
          inner.scrollLeft = inner.scrollWidth;
        }
      }
    };

    const observer = new ResizeObserver(() => {
      scrollToEnd();
    });

    if (calendarRef.current) {
      observer.observe(calendarRef.current);
    }

    // small delay to let mount finish
    setTimeout(() => {
      animate();
      scrollToEnd();
    }, 100);

    setTimeout(scrollToEnd, 1000);
    setTimeout(scrollToEnd, 3000);

    const handleScroll = () => {
      const scroll = window.scrollY;
      setIsScrolled(scroll > 100);

      items.forEach((item) => {
        if (item.id === "logo") return; // Skip logo, handled by state
        const position = item.getBoundingClientRect();
        if (position.top > window.innerHeight - 10 || position.bottom < 20) {
          item.style.scale = "0.85";
        } else {
          item.style.scale = "1";
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const transformData = (data: Array<Activity>) => {
    if (!isMounted || data.length === 0) return data;

    const rows = 7;
    const firstDate = new Date(data[0].date);
    const firstDayOffset = (firstDate.getUTCDay() + 6) % 7;

    const CYCLE_TICKS = 100; // 10s cycle
    const currentTick = tick % CYCLE_TICKS;
    const SWEEP_DURATION_TICKS = 75; // 3s

    const activitiesWithPos = data.map((activity) => {
      const date = new Date(activity.date);
      const diffInDays = Math.round(
        (date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const correctedIndex = diffInDays + firstDayOffset;
      return {
        ...activity,
        x: Math.floor(correctedIndex / rows),
        y: correctedIndex % rows,
      };
    });

    const maxCol = activitiesWithPos[activitiesWithPos.length - 1].x;

    if (isInitialLoading) {
      const fadeStartTick = 30;
      const fadeDurationTicks = 10;
      let alpha = 1;

      if (tick > fadeStartTick) {
        alpha = Math.max(0, 1 - (tick - fadeStartTick) / fadeDurationTicks);
      }

      return activitiesWithPos.map((activity) => {
        const { x, y } = activity;
        const dx = maxCol - x;
        const dy = y - rows / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const rippleValue = Math.sin(distance * 0.5 - tick * 0.3);
        const rippleLevel = Math.floor(((rippleValue + 1) / 2) * 5);
        const realLevel = activity.level;
        const blendedLevel = Math.round(
          rippleLevel * alpha + realLevel * (1 - alpha),
        );

        return {
          date: activity.date,
          count: activity.count,
          level: Math.min(4, Math.max(0, blendedLevel)) as 0 | 1 | 2 | 3 | 4,
        };
      });
    }

    // Recurring Radar Sweep
    if (currentTick < SWEEP_DURATION_TICKS) {
      const progress = currentTick / SWEEP_DURATION_TICKS;
      const sweepX = maxCol - progress * (maxCol + 10);

      return activitiesWithPos.map((activity) => {
        const { x } = activity;
        const realLevel = activity.level;

        const distance = Math.abs(x - sweepX);
        const intensity = Math.max(0, 1 - distance / 3);
        const boost = Math.round(intensity * 2);
        const newLevel = Math.min(4, realLevel + boost);

        return {
          date: activity.date,
          count: activity.count,
          level: newLevel as 0 | 1 | 2 | 3 | 4,
        };
      });
    }

    return data;
  };

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const themeColors = {
    light: "hsl(199, 89%, 48%)", // Premium Sky Blue
    dark: "hsl(199, 89%, 60%)",  // Glowing Sky Blue
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          :root {
            --primary-color: ${themeColors.light} !important;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --primary-color: ${themeColors.dark} !important;
            }
          }
        `,
        }}
      />
      <div
        id="bg-image"
        className={bgLoaded ? "show-image" : ""}
        style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : "none" }}
      />
      <Navbar />
      <div className="container">
        <section id="intro">
          <div className="heading">
            <a href="#" onClick={handleScrollToTop} aria-label="Back to top">
              <div
                id="logo"
                className={`home-logo item ${isScrolled ? "scrolled" : ""}`}
              ></div>
            </a>

            <div className="container-mini">
              <h1 id="title" className="item">
                <span className="name-primary">Falak</span>
                <br />
                <span className="name-secondary">Parmar</span>
              </h1>
              <SocialsChips />
              <div className="item github-calendar" ref={calendarRef}>
                {isMounted && (
                  <GitHubCalendar
                    username="Falak-Parmar"
                    blockMargin={2}
                    blockRadius={10}
                    showColorLegend={false}
                    showMonthLabels={false}
                    showTotalCount={false}
                    weekStart={1}
                    blockSize={10}
                    transformData={transformData}
                    theme={{
                      light: ["#ffffff", themeColors.light],
                      dark: ["#000000", themeColors.dark],
                    }}
                  />
                )}
              </div>
              <GitHubChips />
            </div>
          </div>
        </section>

        {updatesSection}

        <section id="projects">
          <div className="heading item">
            <h2>Projects</h2>
          </div>
          <div className="container">
            <div id="highlights">
              {/* 1. Drift */}
              <a
                id="drift"
                className="highlight-item item"
                href="https://github.com/Falak-Parmar/Drift"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="highlight-content">
                  <h3>Drift</h3>
                  <p className="highlight-description">
                    Cross-platform Universal Control pipeline between macOS (AirDrift) and Android (DroidDrift) allowing mouse and keyboard sharing.
                  </p>
                </div>
              </a>

              {/* 2. AirSync Android */}
              <a
                id="airsync-android"
                className="highlight-item item"
                href="https://github.com/Falak-Parmar/airsync-android/tree/feature/airsync-active-toggle"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="highlight-content">
                  <h3>
                    AirSync Android
                    <span style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "var(--text-color)",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      marginLeft: "10px",
                      display: "inline-block",
                      verticalAlign: "middle"
                    }}>
                      feature/active-toggle
                    </span>
                  </h3>
                  <p className="highlight-description">
                    Kotlin Jetpack Compose client for AirSync. Features custom notification listeners, QR authentication, and a background active-toggle system.
                  </p>
                </div>
              </a>

              {/* 3. Logical Fallacy Detection & CTG */}
              <a
                id="logical-fallacy"
                className="highlight-item item"
                href="https://github.com/Falak-Parmar/LoFa-De_CTG"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="highlight-content">
                  <h3>Logical Fallacy Detection & CTG</h3>
                  <p className="highlight-description">
                    Fine-tuned RoBERTa models and data pipelines for fallacy classification, achieving 80.65% Test F1 using inverse-frequency weighting & threshold calibration.
                  </p>
                </div>
              </a>

              {/* 4. HEP Event Classification via VQC */}
              <a
                id="essentials"
                className="highlight-item item"
                href="https://github.com/Falak-Parmar/Particle-Physics-classification-using-VQC.git"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="highlight-content">
                  <h3>HEP Event Classification via VQC</h3>
                  <p className="highlight-description">
                    A hybrid quantum-classical machine learning algorithm for event classification in high-energy physics using Variational Quantum Circuits.
                  </p>
                </div>
              </a>

              {/* 5. Book-Finder */}
              <a
                id="zen-t"
                className="highlight-item item"
                href="https://github.com/Falak-Parmar/Book-Finder"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="highlight-content">
                  <h3>Book-Finder</h3>
                  <p className="highlight-description">
                    A robust data pipeline and semantic search system designed to extract and clean datasets for NLP models.
                  </p>
                </div>
              </a>

              {/* 6. Contributions Header */}
              <div style={{ marginTop: "2.5rem", marginBottom: "0.5rem" }} className="heading item">
                <h2 style={{ fontSize: "1.45rem", opacity: 0.85 }}>Contributions</h2>
              </div>

              {/* Contribution 1: SpotiFLAC */}
              <a
                id="spotiflac"
                className="highlight-item item"
                href="https://github.com/BartolomeoRusso9/SpotiFLAC-Module-Version/pull/132"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="highlight-content">
                  <h3>
                    SpotiFLAC-Module-Version
                    <span style={{
                      background: "rgba(100, 220, 255, 0.12)",
                      border: "1px solid rgba(100, 220, 255, 0.25)",
                      color: "#64dcff",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      marginLeft: "10px",
                      display: "inline-block",
                      verticalAlign: "middle"
                    }}>
                      Contributor
                    </span>
                  </h3>
                  <p className="highlight-description">
                    Contributed to SpotiFLAC: resolved API resolver validations and implemented robust token auto-renewal mechanics.
                  </p>
                </div>
              </a>

              {/* Contribution 2: ml-assisted-re-distribution */}
              <a
                id="ml-redistribution"
                className="highlight-item item"
                href="https://github.com/AdityaJana011/ml-assisted-re-distribution"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="highlight-content">
                  <h3>
                    ml-assisted-re-distribution
                    <span style={{
                      background: "rgba(100, 220, 255, 0.12)",
                      border: "1px solid rgba(100, 220, 255, 0.25)",
                      color: "#64dcff",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      marginLeft: "10px",
                      display: "inline-block",
                      verticalAlign: "middle"
                    }}>
                      Contributor
                    </span>
                  </h3>
                  <p className="highlight-description">
                    Co-authored the machine learning pipelines and statistical models for assisting optimal resource re-distribution.
                  </p>
                </div>
              </a>

              {/* 7. More on GitHub */}
              <a
                id="more-github"
                className="highlight-item item"
                href="https://github.com/Falak-Parmar"
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: "1.5rem" }}
              >
                <div className="highlight-content">
                  <h3>More on GitHub</h3>
                  <p className="highlight-description">
                    Explore all my other data pipelines, quantum computing setups, and open-source contributions.
                  </p>
                </div>
              </a>
            </div>
          </div>
        </section>

        <section id="about-me">
          <div className="heading item">
            <h2>About Me</h2>
          </div>
          <div className="content">
            <p className="item">
              A passionate Data Scientist bridging the gap between theoretical physics and applied machine learning. Transitioned from B.Sc. in Physics to M.Sc. in Data Science at DAU (formerly DAIICT) to study Neural Networks' ability in understanding Logical Fallacies using the CoCoLoFa dataset.
            </p>
            <div className="details-pills">
              <div className="pill item">
                <span className="material-symbols-rounded">person</span>
                <span>Falak Parmar</span>
              </div>
              <div className="pill item">
                <span className="material-symbols-rounded">cake</span>
                <span>22</span>
              </div>
              <div className="pill item">
                <span className="material-symbols-rounded">location_on</span>
                <span>Gandhinagar, India</span>
              </div>
              <div className="pill item">
                <span className="material-symbols-rounded">school</span>
                <span>M.Sc. Data Science Student @ DAU</span>
              </div>
              <div className="pill item">
                <span className="material-symbols-rounded">work</span>
                <span>Physics Alum | Quantum & Data Enthusiast</span>
              </div>
              <div className="pill item">
                <span className="material-symbols-rounded">code</span>
                <a
                  href="https://github.com/Falak-Parmar"
                  aria-label="Falak's github link"
                  className="skill-icon-container"
                >
                  <img
                    className=" skill-icons"
                    src="https://skillicons.dev/icons?i=python&theme=light"
                    alt="My skills"
                  />
                  <img
                    className=" skill-icons"
                    src="https://skillicons.dev/icons?i=pytorch&theme=light"
                    alt="My skills"
                  />
                  <img
                    className=" skill-icons"
                    src="https://skillicons.dev/icons?i=tensorflow&theme=light"
                    alt="My skills"
                  />
                  <img
                    className=" skill-icons"
                    src="https://skillicons.dev/icons?i=swift&theme=light"
                    alt="My skills"
                  />
                  <img
                    className=" skill-icons"
                    src="https://skillicons.dev/icons?i=git&theme=light"
                    alt="My skills"
                  />
                  <img
                    className=" skill-icons"
                    src="https://skillicons.dev/icons?i=cpp&theme=light"
                    alt="My skills"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact">
          <div className="heading item">
            <h2>Connect</h2>
          </div>
          <div className="content">
            <p className="item">
              If you have any questions or want to work with me, feel free to connect via my email or view my resume.
            </p>
            <div className="socials-chips item" style={{ padding: "1.5rem 0", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
              <a
                href="mailto:falakparmar2004@gmail.com"
                className="socials-chip"
                data-social="email"
              >
                <i className="fa-regular fa-envelope" />
                <span>Mail</span>
              </a>
              <a
                href={`${basePath}/assets/falak_parmar.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="socials-chip"
                data-social="resume"
              >
                <i className="fa-regular fa-file-pdf" />
                <span>Resume</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
