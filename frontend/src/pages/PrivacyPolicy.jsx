import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../App";

const BRAND = "#0052CC";

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

function Para({ children }) {
  return (
    <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 mb-3">
      {children}
    </p>
  );
}

function SubHeading({ children, darkMode }) {
  return (
    <h3
      className="text-[15px] font-bold mt-5 mb-2"
      style={{ color: darkMode ? "#cbd5e1" : "#334155" }}
    >
      {children}
    </h3>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1 mb-3 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[7px]"
            style={{ backgroundColor: BRAND }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicy() {
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
          <span className={darkMode ? "text-slate-300" : "text-slate-600"}>Privacy Policy</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1
            className="font-bold text-[36px] sm:text-[44px] leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Privacy Policy
          </h1>
          <div className="w-16 h-[3px] rounded mb-5" style={{ backgroundColor: BRAND }} />
          <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">
            Last Updated: May 2026
          </p>
        </header>

        <Para>
          The Venture Republic (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to
          protecting the privacy of every visitor and user of our website and services. This Privacy Policy
          explains what information we collect, how we use it, and what rights you have over your data. By
          accessing or using theventurerepublic.in, you agree to the practices described in this policy.
        </Para>

        {/* 1. Information We Collect */}
        <Section title="1. Information We Collect" darkMode={darkMode}>
          <SubHeading darkMode={darkMode}>1.1 Information You Provide</SubHeading>
          <Para>
            When you register an account, submit a story pitch, apply as a reporter, or contact us
            directly, we may collect:
          </Para>
          <BulletList items={[
            "Your name and email address",
            "Phone number (for reporter registration and login)",
            "Professional details (company, role, industry) where voluntarily provided",
            "Content you submit, including article pitches, feedback, and correspondence",
          ]} />

          <SubHeading darkMode={darkMode}>1.2 Usage Data Collected Automatically</SubHeading>
          <Para>
            When you visit our website, our servers and analytics tools automatically record certain
            information, including:
          </Para>
          <BulletList items={[
            "IP address and approximate geographic location",
            "Browser type, version, and operating system",
            "Pages you visit, time spent, and navigation paths",
            "Referring URLs and search terms that brought you to our site",
            "Device identifiers and screen resolution",
          ]} />

          <SubHeading darkMode={darkMode}>1.3 Cookies &amp; Local Storage</SubHeading>
          <Para>
            We use cookies, local storage, and similar tracking technologies to remember your preferences
            (such as dark mode and language settings), keep you logged in, and understand how our content
            is consumed. You can control cookie behaviour through your browser settings, though disabling
            cookies may affect some features.
          </Para>
        </Section>

        {/* 2. How We Use Information */}
        <Section title="2. How We Use Your Information" darkMode={darkMode}>
          <Para>We use the information we collect for the following purposes:</Para>
          <BulletList items={[
            "To operate, personalise, and improve our website and editorial products",
            "To authenticate your account and ensure platform security",
            "To send you newsletters, alerts, and editorial updates you have opted into",
            "To respond to your inquiries, submissions, and support requests",
            "To analyse traffic patterns and measure content performance",
            "To comply with applicable laws, regulations, and legal obligations",
            "To detect, investigate, and prevent fraud or misuse of our services",
          ]} />
          <Para>
            We do not sell your personal information to third parties. We do not use your data for
            automated profiling or decision-making that produces legal or similarly significant effects.
          </Para>
        </Section>

        {/* 3. Cookies Policy */}
        <Section title="3. Cookies Policy" darkMode={darkMode}>
          <Para>
            Our website uses cookies to provide a better experience and to understand how users interact
            with our content. The types of cookies we use include:
          </Para>
          <BulletList items={[
            "Essential cookies: Required for basic site functionality such as session management and login state.",
            "Preference cookies: Store your settings such as dark mode, language selection, and saved articles.",
            "Analytics cookies: Help us understand page views, session duration, and content performance.",
            "Marketing cookies: Used sparingly for understanding referral sources; we do not run behavioural ad targeting.",
          ]} />
          <Para>
            You can opt out of non-essential cookies by adjusting your browser settings or using a
            browser extension. Please note that opting out of certain cookies may affect the functionality
            of personalisation features.
          </Para>
        </Section>

        {/* 4. Third-Party Services */}
        <Section title="4. Third-Party Services" darkMode={darkMode}>
          <Para>
            We work with a limited number of trusted third-party services to operate our platform. These
            may include:
          </Para>
          <BulletList items={[
            "Google Analytics: We use Google Analytics to measure website traffic and audience behaviour. Google may use this data in accordance with its own privacy policy.",
            "Cloud hosting providers: Our infrastructure is hosted on secure cloud platforms subject to data processing agreements.",
            "Payment processors: If applicable, payment information is handled exclusively by PCI-DSS compliant processors and is never stored on our servers.",
            "Email service providers: We use reputable email platforms to deliver newsletters and transactional emails.",
          ]} />
          <Para>
            Each third-party service we use is carefully evaluated. We only share the minimum data
            necessary for each service to function. We encourage you to review the privacy policies of
            these providers independently.
          </Para>
        </Section>

        {/* 5. Data Retention */}
        <Section title="5. Data Retention" darkMode={darkMode}>
          <Para>
            We retain personal data only for as long as necessary to fulfil the purposes described in
            this policy, or as required by applicable law. Specifically:
          </Para>
          <BulletList items={[
            "Account data is retained for the lifetime of your account and for up to 12 months after account deletion.",
            "Analytics data is retained in aggregated, anonymised form for up to 26 months.",
            "Email correspondence is retained for up to 3 years for operational and legal purposes.",
            "Log data is automatically purged after 90 days.",
          ]} />
          <Para>
            You may request deletion of your personal data at any time by contacting us at the address
            below. We will action such requests within 30 days, subject to any legal obligations that
            require us to retain certain records.
          </Para>
        </Section>

        {/* 6. Your Rights */}
        <Section title="6. Your Rights" darkMode={darkMode}>
          <Para>
            Regardless of where you are located, we are committed to honoring the following rights with
            respect to your personal data:
          </Para>
          <BulletList items={[
            "Right of access: Request a copy of the personal data we hold about you.",
            "Right to rectification: Request correction of inaccurate or incomplete information.",
            "Right to erasure: Request deletion of your personal data (subject to legal retention requirements).",
            "Right to restriction: Request that we limit processing of your data in certain circumstances.",
            "Right to data portability: Receive your data in a structured, machine-readable format.",
            "Right to object: Opt out of marketing communications or analytics tracking at any time.",
          ]} />
          <Para>
            To exercise any of these rights, or if you have concerns about how we handle your data,
            please contact our privacy team:
          </Para>
          <a
            href="mailto:privacy@theventurerepublic.in"
            className="inline-flex items-center gap-2 text-[15px] font-semibold hover:underline"
            style={{ color: BRAND }}
          >
            privacy@theventurerepublic.in
          </a>
        </Section>

        {/* 7. Children's Privacy */}
        <Section title="7. Children&rsquo;s Privacy" darkMode={darkMode}>
          <Para>
            Our services are intended for users aged 13 and above. We do not knowingly collect personal
            information from children under the age of 13. If we become aware that we have inadvertently
            collected such data, we will delete it promptly. Parents or guardians who believe their child
            has provided us with personal information may contact us at hello@theventurerepublic.in.
          </Para>
        </Section>

        {/* 8. Changes */}
        <Section title="8. Changes to This Policy" darkMode={darkMode}>
          <Para>
            We may update this Privacy Policy from time to time to reflect changes in our practices,
            technology, or legal requirements. When we make material changes, we will update the
            &ldquo;Last Updated&rdquo; date at the top of this page and, where appropriate, notify
            registered users via email. We encourage you to review this policy periodically.
          </Para>
        </Section>

        {/* Contact */}
        <section
          className={`rounded-xl p-6 mb-10 border ${
            darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2
            className="text-[16px] font-bold mb-3"
            style={{ fontFamily: "'Georgia', serif", color: darkMode ? "#e2e8f0" : "#1e293b" }}
          >
            Contact Us About Privacy
          </h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-2">
            The Venture Republic, Bengaluru, Karnataka, India
          </p>
          <a
            href="mailto:privacy@theventurerepublic.in"
            className="text-[14px] font-medium hover:underline"
            style={{ color: BRAND }}
          >
            privacy@theventurerepublic.in
          </a>
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
