import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../App";

const BRAND = "#0052CC";

export default function ContactPage() {
  const { darkMode } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${darkMode ? "bg-slate-900 text-slate-100" : "bg-[#F8FAFC] text-slate-800"}`}>
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] mb-8" aria-label="Breadcrumb">
          <Link to="/" className={`hover:underline ${darkMode ? "text-blue-400" : "text-[#0052CC]"}`}>
            Home
          </Link>
          <span className={darkMode ? "text-slate-500" : "text-slate-400"}>/</span>
          <span className={darkMode ? "text-slate-300" : "text-slate-600"}>Contact</span>
        </nav>

        {/* Heading */}
        <header className="mb-10">
          <h1
            className="font-bold text-[36px] sm:text-[44px] leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Contact Us
          </h1>
          <div className="w-16 h-[3px] rounded mb-5" style={{ backgroundColor: BRAND }} />
          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
            We&rsquo;d love to hear from you &mdash; whether you&rsquo;re a founder, investor, journalist,
            or reader. Reach us through the channels below and we&rsquo;ll get back to you promptly.
          </p>
        </header>

        {/* Editorial & General */}
        <section
          className={`rounded-xl p-6 mb-6 border ${
            darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2
            className="text-[16px] font-bold mb-3"
            style={{ fontFamily: "'Georgia', serif", color: darkMode ? "#e2e8f0" : "#1e293b" }}
          >
            Editorial &amp; General Inquiries
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-3">
            For editorial queries, press releases, partnerships, or advertising inquiries:
          </p>
          <a
            href="mailto:hello@theventurerepublic.in"
            className="inline-flex items-center gap-2 text-[15px] font-semibold hover:underline"
            style={{ color: BRAND }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            hello@theventurerepublic.in
          </a>
        </section>

        {/* Startup Submissions */}
        <section
          className={`rounded-xl p-6 mb-6 border ${
            darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2
            className="text-[16px] font-bold mb-3"
            style={{ fontFamily: "'Georgia', serif", color: darkMode ? "#e2e8f0" : "#1e293b" }}
          >
            Startup Submissions &amp; Coverage Requests
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400">
            Building something exciting? For startup submissions and coverage requests, email us with your
            pitch &mdash; include your deck, funding status, and a brief founder bio. We review every
            submission and reach out when there&rsquo;s a fit.
          </p>
          <a
            href="mailto:hello@theventurerepublic.in"
            className="inline-flex items-center gap-2 text-[14px] font-medium mt-3 hover:underline"
            style={{ color: BRAND }}
          >
            hello@theventurerepublic.in
          </a>
        </section>

        {/* Advertising */}
        <section
          className={`rounded-xl p-6 mb-6 border ${
            darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2
            className="text-[16px] font-bold mb-3"
            style={{ fontFamily: "'Georgia', serif", color: darkMode ? "#e2e8f0" : "#1e293b" }}
          >
            Advertising &amp; Sponsorship
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-3">
            Reach India&rsquo;s most engaged startup audience. For advertising and sponsorship opportunities
            &mdash; including newsletter sponsorships, branded content, and display advertising:
          </p>
          <a
            href="mailto:ads@theventurerepublic.in"
            className="inline-flex items-center gap-2 text-[15px] font-semibold hover:underline"
            style={{ color: BRAND }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            ads@theventurerepublic.in
          </a>
        </section>

        {/* Address & Social */}
        <section
          className={`rounded-xl p-6 mb-10 border ${
            darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2
            className="text-[16px] font-bold mb-4"
            style={{ fontFamily: "'Georgia', serif", color: darkMode ? "#e2e8f0" : "#1e293b" }}
          >
            Our Office
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-5">
            <span className="font-medium text-slate-700 dark:text-slate-200">The Venture Republic</span>
            <br />
            Bengaluru, Karnataka, India
          </p>
          <h3
            className="text-[14px] font-bold mb-3 text-slate-700 dark:text-slate-200"
          >
            Follow Us
          </h3>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://twitter.com/VentureRepublic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[14px] font-medium hover:underline"
              style={{ color: BRAND }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @VentureRepublic
            </a>
            <a
              href="https://www.linkedin.com/company/theventurerepublic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[14px] font-medium hover:underline"
              style={{ color: BRAND }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </section>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[14px] font-medium hover:underline"
          style={{ color: BRAND }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
      </div>
    </div>
  );
}
