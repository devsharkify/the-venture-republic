import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../App";

const BRAND = "#0F172A";
const ACCENT = "#F59E0B";

function Para({ children }) {
  return (
    <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 mb-3">
      {children}
    </p>
  );
}

function Section({ title, children, darkMode }) {
  return (
    <section className="mb-8">
      <h2
        className="text-[18px] font-bold mt-8 mb-3"
        style={{ fontFamily: "'Georgia', serif", color: darkMode ? "#e2e8f0" : "#1e293b" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1 mb-3 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[7px]"
            style={{ backgroundColor: ACCENT }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }) {
  return (
    <ol className="space-y-3 mb-3 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
          <span
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold text-white mt-0.5"
            style={{ backgroundColor: BRAND }}
          >
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function TopicPill({ label, darkMode }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium border ${
        darkMode
          ? "bg-slate-700 border-slate-600 text-slate-200"
          : "bg-white border-slate-200 text-slate-700"
      }`}
    >
      {label}
    </span>
  );
}

export default function WriteForUs() {
  const { darkMode } = useContext(AppContext);
  const navigate = useNavigate();

  const topics = [
    "Funding trends & VC landscape",
    "B2B SaaS growth stories",
    "Electric vehicles & clean mobility",
    "Fintech & embedded finance",
    "D2C brands & consumer tech",
    "Policy impact on Indian startups",
    "Founder journeys & lessons learned",
    "Deep tech & AI in India",
    "Women founders & inclusive ecosystems",
    "Tier-2 & tier-3 city startups",
    "Startup exits & M&A activity",
    "Corporate innovation & intrapreneurship",
  ];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-slate-900 text-slate-100" : "bg-[#F8FAFC] text-slate-800"}`}>
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] mb-8" aria-label="Breadcrumb">
          <Link to="/" className={`hover:underline ${darkMode ? "text-blue-400" : "text-[#0F172A]"}`}>
            Home
          </Link>
          <span className={darkMode ? "text-slate-500" : "text-slate-400"}>/</span>
          <span className={darkMode ? "text-slate-300" : "text-slate-600"}>Write for Us</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <h1
            className="font-bold text-[36px] sm:text-[44px] leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Write for The Venture Republic
          </h1>
          <div className="w-16 h-[3px] rounded mb-5" style={{ backgroundColor: ACCENT }} />
          <Para>
            We welcome contributions from startup founders, investors, policy experts, independent
            researchers, and business journalists across India. If you have a perspective on the
            Indian startup ecosystem that deserves a wider audience, we want to hear from you.
          </Para>
          <Para>
            The Venture Republic publishes sharp, original thinking that goes beyond press releases
            and surface-level takes. We are looking for writers who understand the nuances of
            building, funding, or governing businesses in India &mdash; and who can communicate
            those nuances with clarity and conviction.
          </Para>
        </header>

        {/* What We Publish */}
        <Section title="What We Publish" darkMode={darkMode}>
          <Para>
            We publish a wide range of editorial formats. Contributors are welcome to pitch across
            any of the following:
          </Para>
          <BulletList items={[
            "Founder stories — First-person accounts of building a startup in India, including the hard lessons, pivots, and breakthroughs that rarely make press releases.",
            "Investment analysis — Sector-specific deep dives into funding trends, emerging categories, and what Indian venture capital is (and isn't) backing right now.",
            "Policy commentary — Informed, evidence-based perspectives on how regulation, government schemes, and policy shifts are reshaping the startup landscape.",
            "Startup ecosystem deep dives — Long-form analysis of specific sectors, geographies, or cohorts within the Indian startup ecosystem.",
            "Op-eds on Indian tech & business — Opinionated, well-argued pieces on the forces shaping India's entrepreneurial economy — from talent and capital to infrastructure and culture.",
          ]} />
        </Section>

        {/* Submission Guidelines */}
        <Section title="Submission Guidelines" darkMode={darkMode}>
          <Para>
            To maintain the editorial quality our readers expect, all contributed content must meet
            the following standards:
          </Para>
          <NumberedList items={[
            "Original, unpublished content only. We do not accept articles that have been published elsewhere, including on personal blogs, LinkedIn Articles, or other media outlets. Simultaneous submissions are not accepted.",
            "Minimum 600 words. Pieces under 600 words are unlikely to provide the depth our readers expect. Most published contributions fall between 800 and 1,500 words.",
            "Include your bio and LinkedIn profile. All contributors must provide a short author bio (2–3 sentences) and a link to their LinkedIn profile for verification and the author byline.",
            "No promotional or self-serving content. We do not publish content whose primary purpose is to market a product, service, or company — including the author's own. Mentions of relevant companies or products are acceptable only when editorially justified.",
            "We reserve the right to edit for style and clarity. Accepted pieces will be edited in accordance with our editorial style guide. We will share significant edits with you before publication, but minor edits for grammar, clarity, and house style may be made without prior approval.",
            "Response time is 5–7 business days. We review every pitch carefully. If you have not heard from us within 7 business days, you may follow up once by email.",
          ]} />
        </Section>

        {/* Topics */}
        <Section title="Topics We're Looking For" darkMode={darkMode}>
          <Para>
            We are particularly interested in pitches that touch on the following themes. This list
            is not exhaustive &mdash; if your idea is relevant and original, pitch it.
          </Para>
          <div className="flex flex-wrap gap-2 mt-3 mb-4">
            {topics.map((topic, i) => (
              <TopicPill key={i} label={topic} darkMode={darkMode} />
            ))}
          </div>
          <Para>
            We are especially keen to receive pitches from voices that are underrepresented in
            mainstream startup media &mdash; including founders from tier-2 and tier-3 cities,
            women entrepreneurs, and domain experts from non-tech industries embracing digital
            transformation.
          </Para>
        </Section>

        {/* What We Don't Accept */}
        <Section title="What We Don&rsquo;t Accept" darkMode={darkMode}>
          <BulletList items={[
            "Press releases or content written primarily to promote a company, product, or funding round",
            "Content that makes financial or investment recommendations to readers",
            "Articles that have been produced or significantly assisted by AI without editorial disclosure",
            "Plagiarised content or content that infringes third-party intellectual property",
            "Personal attacks, defamatory statements, or unsubstantiated allegations",
          ]} />
        </Section>

        {/* Payment note */}
        <section
          className={`rounded-xl p-5 mb-8 border-l-4 ${
            darkMode ? "bg-slate-800/60 border-amber-500" : "bg-amber-50 border-amber-400"
          }`}
        >
          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-700 dark:text-slate-200">A note on compensation:</span>{" "}
            We do not pay for contributed content at this time. Contributors receive a byline,
            a short author bio with links, and the opportunity to reach The Venture Republic&rsquo;s
            engaged readership of startup professionals across India. We hope to introduce
            contributor compensation as we grow.
          </p>
        </section>

        {/* CTA */}
        <section
          className={`rounded-xl p-6 mb-10 border ${
            darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2
            className="text-[18px] font-bold mb-3"
            style={{ fontFamily: "'Georgia', serif", color: darkMode ? "#e2e8f0" : "#1e293b" }}
          >
            Ready to Pitch?
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-3">
            Send your pitch to our editorial team. A pitch should be 2–3 paragraphs describing
            your proposed article, the key argument or story, and why our audience should care.
            You do not need to send a full draft to begin &mdash; a well-written pitch is enough
            for us to make an initial decision.
          </p>
          <div className="space-y-2">
            <p className="text-[14px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Email:</span>{" "}
              <a
                href="mailto:editorial@theventurerepublic.in"
                className="hover:underline font-medium"
                style={{ color: BRAND }}
              >
                editorial@theventurerepublic.in
              </a>
            </p>
            <p className="text-[14px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Subject line:</span>{" "}
              <span className="font-mono text-[13px]">Contributor Pitch — [Your Topic]</span>
            </p>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1">
              Please include your name, a brief bio, your LinkedIn profile URL, and your pitch
              in the body of the email.
            </p>
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
