import "@/styles/index/socials-chips.css";

const SOCIALS = [
  {
    label: "GitHub",
    url: "https://github.com/Falak-Parmar",
    icon: <i className="fa-brands fa-github" />,
    social: "github",
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/falak-parmar-7b3b51256",
    icon: <i className="fa-brands fa-linkedin" />,
    social: "linkedin",
  },
  {
    label: "Codeberg",
    url: "https://codeberg.org/Falak-Parmar",
    icon: (
      <svg viewBox="0 0 512 512" width="16" height="16" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg">
        <path d="M256 0c141.4 0 256 114.6 256 256S397.4 512 256 512 0 397.4 0 256 114.6 0 256 0zM121 346.2h270L256 102.6 121 346.2z"/>
      </svg>
    ),
    social: "codeberg",
  },
];

export default function SocialsChips() {
  return (
    <div className="socials-chips item">
      {SOCIALS.map((s) => (
        <a
          key={s.label}
          href={s.url}
          target={s.url.startsWith("mailto") ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="socials-chip"
          data-social={s.social}
        >
          {s.icon}
          <span>{s.label}</span>
        </a>
      ))}
    </div>
  );
}
