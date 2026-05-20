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

function StatCard({ value, label, darkMode }) {
  return (
    <div
      className={`rounded-xl p-5 text-center border ${
        darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      <p className="text-[28px] font-bold mb-1" style={{ color: ACCENT }}>{value}</p>
      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">{label}</p>
    </div>
  );
}

function AdCard({ title, description, icon, darkMode }) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      <div className="text-[28px] mb-3">{icon}</div>
      <h3
        className="text-[16px] font-bold mb-2"
        style={{ fontFamily: "'Georgia', serif", color: darkMode ? "#e2e8f0" : "#1e293b" }}
      >
        {title}
      </h3>
      <p className="text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
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

export default function AdvertisePage() {
  const { darkMode } = useContext(AppContext);
  const navigate = useNavigate();

  const adOptions = [
    {
      icon: "✍️",
      title: "Sponsored Articles",
      description:
        "In-depth branded content written or co-written with our editorial team. Your brand's perspective, delivered with The Venture Republic's journalistic credibility. Ideal for thought leadership, product launches, and market education.",
    },
    {
      icon: "🖼️",
      title: "Display Banners",
      description:
        "High-visibility banner placements on our homepage, article pages, and category feeds. Available in multiple sizes and positions. Reach decision-makers exactly when they're consuming startup news.",
    },
    {
      icon: "📧",
      title: "Newsletter Sponsorship",
      description:
        "Reach our highly engaged subscriber base directly in their inbox. Newsletter sponsorships include a branded slot in our weekly digest, read by founders, investors, and CXOs across India.",
    },
    {
      icon: "📢",
      title: "Event Coverage",
      description:
        "Amplify your announcements - funding rounds, product launches, leadership hires, and milestones - through dedicated editorial coverage and social amplification. Get your news in front of the right audience on the right day.",
    },
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
          <span className={darkMode ? "text-slate-300" : "text-slate-600"}>Advertise</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <h1
            className="font-bold text-[36px] sm:text-[44px] leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Reach India&rsquo;s Startup Ecosystem
          </h1>
          <div className="w-16 h-[3px] rounded mb-5" style={{ backgroundColor: ACCENT }} />
          <Para>
            The Venture Republic is India&rsquo;s premier startup intelligence platform, read
            by founders, investors, CXOs, and policy makers across the country. Partner with
            us to put your brand in front of the people who are building, funding, and shaping
            the next generation of Indian businesses.
          </Para>
        </header>

        {/* Audience Stats */}
        <Section title="Our Audience" darkMode={darkMode}>
          <Para>
            Every month, tens of thousands of India&rsquo;s most influential business minds
            turn to The Venture Republic for startup news, funding intelligence, and ecosystem
            analysis. Here is a snapshot of who reads us:
          </Para>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 mb-6">
            <StatCard value="50,000+" label="Monthly Readers" darkMode={darkMode} />
            <StatCard value="70%" label="Decision Makers" darkMode={darkMode} />
            <StatCard value="4.2 min" label="Avg. Time on Page" darkMode={darkMode} />
            <StatCard value="18,000+" label="Newsletter Subscribers" darkMode={darkMode} />
          </div>
          <Para>
            Our readers are predominantly professionals aged 25&ndash;45, concentrated in
            India&rsquo;s top startup hubs:
          </Para>
          <BulletList items={[
            "Bengaluru - India's Silicon Valley, home to our largest reader segment",
            "Mumbai - Financial capital, strong representation from VC and PE professionals",
            "Delhi NCR - Policy makers, enterprise buyers, and D2C founders",
            "Hyderabad - Fast-growing tech and pharma ecosystem readers",
            "Pune, Chennai & beyond - Rapidly expanding tier-2 startup city coverage",
          ]} />
        </Section>

        {/* Advertising Options */}
        <Section title="Advertising Options" darkMode={darkMode}>
          <Para>
            We offer flexible partnership formats designed to suit different campaign goals,
            budgets, and timelines. All placements are clearly disclosed in accordance with
            our editorial standards.
          </Para>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {adOptions.map((opt, i) => (
              <AdCard key={i} {...opt} darkMode={darkMode} />
            ))}
          </div>
        </Section>

        {/* Why Advertise */}
        <Section title="Why Advertise With Us?" darkMode={darkMode}>
          <BulletList items={[
            "Premium, contextual audience: Every reader is here because they care about the startup ecosystem - no wasted impressions.",
            "Editorial credibility: Sponsored content on The Venture Republic carries the trust readers place in our editorial voice.",
            "Precise targeting: Reach readers by category - Fintech, SaaS, EV, D2C, Policy, and more.",
            "Engaged readership: Our average reader spends over four minutes per article - well above industry benchmarks.",
            "Transparent reporting: All campaigns come with clear performance summaries covering reach, clicks, and engagement.",
            "Flexible formats: From a single newsletter slot to a multi-month content partnership, we design campaigns around your goals.",
          ]} />
        </Section>

        {/* Testimonial / positioning */}
        <section
          className={`rounded-xl p-6 mb-8 border-l-4 ${
            darkMode ? "bg-slate-800/60 border-amber-500" : "bg-amber-50 border-amber-400"
          }`}
        >
          <p className="text-[15px] italic leading-relaxed text-slate-600 dark:text-slate-300 mb-3">
            &ldquo;We don&rsquo;t just place your ad &mdash; we help you tell a story that
            India&rsquo;s startup community actually wants to read.&rdquo;
          </p>
          <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
            &mdash; The Venture Republic Partnerships Team
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
            Get in Touch
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-4">
            Ready to reach India&rsquo;s most engaged startup audience? Our partnerships team
            will work with you to design a campaign that meets your objectives and budget.
          </p>
          <div className="space-y-2">
            <p className="text-[14px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Advertising enquiries:</span>{" "}
              <a href="mailto:ads@theventurerepublic.in" className="hover:underline font-medium" style={{ color: BRAND }}>
                ads@theventurerepublic.in
              </a>
            </p>
            <p className="text-[14px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Media kit &amp; rate card:</span>{" "}
              <a href="mailto:ads@theventurerepublic.in" className="hover:underline font-medium" style={{ color: BRAND }}>
                ads@theventurerepublic.in
              </a>
            </p>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1">
              Please include your company name, campaign objective, and preferred timeframe
              in your email and our team will respond within 2 business days.
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
