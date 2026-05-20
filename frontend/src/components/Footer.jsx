import { useContext } from "react";
import { Twitter, Linkedin, Instagram } from "lucide-react";
import { AppContext } from "../App";

const SECTIONS = [
  { label: "All News", href: "/" },
  { label: "Funding", href: "/?cat=funding" },
  { label: "Startups", href: "/?cat=startups" },
  { label: "Technology", href: "/?cat=technology" },
  { label: "Fintech", href: "/?cat=fintech" },
  { label: "Policy", href: "/?cat=policy" },
  { label: "IPO & Markets", href: "/?cat=ipo" },
  { label: "Venture Capital", href: "/?cat=vc" },
];

const COMPANY = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Advertise With Us", href: "/advertise" },
  { label: "Write For Us", href: "/write-for-us" },
];

const LEGAL = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
];

const SOCIALS = [
  { Icon: Twitter, href: "https://twitter.com/venturerepublic", label: "Twitter / X" },
  { Icon: Linkedin, href: "https://linkedin.com/company/venturerepublic", label: "LinkedIn" },
  { Icon: Instagram, href: "https://instagram.com/venturerepublic", label: "Instagram" },
];

export const Footer = () => {
  const { darkMode } = useContext(AppContext);

  return (
    <footer className="mt-16 bg-[#0F172A]">
      {/* 2px accent line at top */}
      <div className="h-[2px] bg-slate-700" />

      {/* Main grid */}
      <div className="max-w-screen-xl mx-auto px-6 pt-12 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Column 1 — Brand */}
          <div className="lg:col-span-1">
            <span className="font-serif-display text-[24px] font-black tracking-tight leading-none text-white">
              The Venture Republic
            </span>
            <div className="mt-3 w-8 h-[2px] bg-slate-600" />
            <p className="text-[12px] leading-relaxed mt-4 text-slate-400">
              India's Premier Startup Intelligence Platform — delivering real-time funding news, founder stories, and venture insights.
            </p>
            <p className="text-[11px] mt-3 text-slate-600">
              Bengaluru, Karnataka, India
            </p>
          </div>

          {/* Column 2 — Sections */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-4">
              Sections
            </h3>
            <nav className="flex flex-col gap-2">
              {SECTIONS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-[13px] text-slate-400 hover:text-white transition-colors duration-150"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Column 3 — Company */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-4">
              Company
            </h3>
            <nav className="flex flex-col gap-2">
              {COMPANY.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-[13px] text-slate-400 hover:text-white transition-colors duration-150"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Column 4 — Legal */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-4">
              Legal
            </h3>
            <nav className="flex flex-col gap-2">
              {LEGAL.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-[13px] text-slate-400 hover:text-white transition-colors duration-150"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-screen-xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-600">
            &copy; {new Date().getFullYear()} The Venture Republic. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-slate-600 hover:text-slate-300 transition-colors duration-150"
              >
                <Icon size={15} strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
