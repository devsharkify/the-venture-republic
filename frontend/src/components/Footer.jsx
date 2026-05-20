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
  { label: "IPO", href: "/?cat=ipo" },
  { label: "VC", href: "/?cat=vc" },
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

function ColHeading({ darkMode, children }) {
  return (
    <h3
      className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 mb-3 inline-block border-b border-[#0052CC] ${
        darkMode ? "text-slate-300" : "text-slate-700"
      }`}
    >
      {children}
    </h3>
  );
}

function FooterLink({ href, darkMode, children }) {
  return (
    <a
      href={href}
      className={`block text-[12px] leading-relaxed transition-colors duration-150 ${
        darkMode
          ? "text-slate-400 hover:text-slate-100"
          : "text-slate-500 hover:text-[#0052CC]"
      }`}
    >
      {children}
    </a>
  );
}

export const Footer = () => {
  const { darkMode } = useContext(AppContext);

  return (
    <footer
      className={`mt-16 border-t ${
        darkMode
          ? "bg-[#060B16] border-slate-800/60"
          : "bg-[#F8FAFC] border-slate-200"
      }`}
    >
      {/* Main grid */}
      <div className="max-w-screen-xl mx-auto px-6 pt-10 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Column 1 — Brand */}
          <div className="lg:col-span-1">
            <div className="mb-3">
              <span
                className={`font-serif-display text-[22px] font-black tracking-tight leading-none ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                The Venture Republic
              </span>
              <div className="mt-2 w-10 h-[2px] bg-[#0052CC] rounded-full" />
            </div>
            <p
              className={`text-[12px] leading-relaxed mt-3 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              India's Premier Startup Intelligence Platform
            </p>
            <p
              className={`text-[11px] mt-1 ${
                darkMode ? "text-slate-600" : "text-slate-400"
              }`}
            >
              Bengaluru, Karnataka, India
            </p>
          </div>

          {/* Column 2 — Sections */}
          <div>
            <ColHeading darkMode={darkMode}>Sections</ColHeading>
            <nav className="flex flex-col gap-1.5 mt-1">
              {SECTIONS.map(({ label, href }) => (
                <FooterLink key={label} href={href} darkMode={darkMode}>
                  {label}
                </FooterLink>
              ))}
            </nav>
          </div>

          {/* Column 3 — Company */}
          <div>
            <ColHeading darkMode={darkMode}>Company</ColHeading>
            <nav className="flex flex-col gap-1.5 mt-1">
              {COMPANY.map(({ label, href }) => (
                <FooterLink key={label} href={href} darkMode={darkMode}>
                  {label}
                </FooterLink>
              ))}
            </nav>
          </div>

          {/* Column 4 — Legal */}
          <div>
            <ColHeading darkMode={darkMode}>Legal</ColHeading>
            <nav className="flex flex-col gap-1.5 mt-1">
              {LEGAL.map(({ label, href }) => (
                <FooterLink key={label} href={href} darkMode={darkMode}>
                  {label}
                </FooterLink>
              ))}
            </nav>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div
        className={`border-t ${
          darkMode ? "border-slate-800/60" : "border-slate-200"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className={`text-[11px] ${
              darkMode ? "text-slate-600" : "text-slate-400"
            }`}
          >
            &copy; {new Date().getFullYear()} The Venture Republic. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`transition-colors duration-150 ${
                  darkMode
                    ? "text-slate-600 hover:text-slate-200"
                    : "text-slate-400 hover:text-[#0052CC]"
                }`}
              >
                <Icon size={16} strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
