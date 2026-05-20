import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../App";

const BRAND = "#0F172A";

const categories = [
  "Funding Rounds",
  "Startup Launches",
  "VC & PE",
  "IPO Watch",
  "Policy & Regulation",
  "Technology",
  "Fintech",
];

export default function AboutPage() {
  const { darkMode } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${darkMode ? "bg-slate-900 text-slate-100" : "bg-[#F8FAFC] text-slate-800"}`}>
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] mb-8" aria-label="Breadcrumb">
          <Link to="/" className={`hover:underline ${darkMode ? "text-blue-400" : "text-[#0F172A]"}`}>
            Home
          </Link>
          <span className={darkMode ? "text-slate-500" : "text-slate-400"}>/</span>
          <span className={darkMode ? "text-slate-300" : "text-slate-600"}>About</span>
        </nav>

        {/* Hero */}
        <header className="mb-12">
          <h1
            className="font-serif text-[36px] sm:text-[44px] font-bold leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            About The Venture Republic
          </h1>
          <div className="w-16 h-[3px] rounded mb-6" style={{ backgroundColor: BRAND }} />
          <p className="text-[17px] leading-relaxed font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
            We are India&rsquo;s premier startup intelligence platform &mdash; delivering real-time funding
            news, founder stories, policy updates, and venture capital insights from the heart of Bengaluru.
          </p>
        </header>

        {/* Our Mission */}
        <section className="mb-10">
          <h2
            className="text-[18px] font-bold mt-8 mb-3"
            style={{ fontFamily: "'Georgia', serif", color: darkMode ? "#e2e8f0" : "#1e293b" }}
          >
            Our Mission
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
            India&rsquo;s startup ecosystem is one of the fastest-growing in the world, and it deserves
            journalism that matches its ambition. At The Venture Republic, our mission is to cover this
            ecosystem with integrity, depth, and nuance &mdash; from seed-stage bets in garage offices to
            billion-dollar listings on Dalal Street. We believe informed founders, investors, and operators
            build better companies, and that starts with access to reliable, unbiased news.
          </p>
          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 mt-3">
            We are not a press release aggregator. Every story we publish is researched, verified, and
            written to give you context &mdash; not just facts. Whether it&rsquo;s a Series A raise, a
            regulatory update from SEBI, or a founder&rsquo;s candid post-mortem, we cover it with the
            seriousness it deserves.
          </p>
        </section>

        {/* What We Cover */}
        <section className="mb-10">
          <h2
            className="text-[18px] font-bold mt-8 mb-3"
            style={{ fontFamily: "'Georgia', serif", color: darkMode ? "#e2e8f0" : "#1e293b" }}
          >
            What We Cover
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
            Our editorial scope spans every dimension of the Indian startup and business landscape:
          </p>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat} className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: BRAND }}
                />
                <span className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {cat}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Our Team */}
        <section className="mb-10">
          <h2
            className="text-[18px] font-bold mt-8 mb-3"
            style={{ fontFamily: "'Georgia', serif", color: darkMode ? "#e2e8f0" : "#1e293b" }}
          >
            Our Team
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
            The Venture Republic is built by a team of journalists, analysts, and technologists passionate
            about India&rsquo;s startup journey. Our reporters are embedded in the ecosystems they cover
            &mdash; attending demo days, sitting in on pitches, and building relationships with the founders
            and investors who are shaping tomorrow&rsquo;s economy.
          </p>
          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 mt-3">
            We combine editorial rigour with technology to deliver news faster, smarter, and with greater
            context than traditional media. Our data team tracks funding rounds, valuations, and sector
            trends so our readers always have the full picture.
          </p>
        </section>

        {/* Contact block */}
        <section
          className={`rounded-xl p-6 mb-10 border ${
            darkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2
            className="text-[16px] font-bold mb-3"
            style={{ fontFamily: "'Georgia', serif", color: darkMode ? "#e2e8f0" : "#1e293b" }}
          >
            Get in Touch
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium text-slate-700 dark:text-slate-200">Address:</span>{" "}
            Bengaluru, Karnataka, India
          </p>
          <p className="text-[14px] text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-200">Email:</span>{" "}
            <a
              href="mailto:hello@theventurerepublic.in"
              className="hover:underline"
              style={{ color: BRAND }}
            >
              hello@theventurerepublic.in
            </a>
          </p>
        </section>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[14px] font-medium hover:underline"
          style={{ color: BRAND }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
      </div>
    </div>
  );
}
