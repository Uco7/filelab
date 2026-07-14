import React, { useState, useEffect, useRef } from "react";

/**
 * Privacy Policy — "Reading Room" edition.
 *
 * Designed as an open ledger/book rather than a generic legal page, since
 * this belongs to a bookstore/library app. Left spine holds a chapter
 * index (numbering here is earned — this is a real sequential document);
 * the right page is the policy itself, set in a serif reading type with
 * a drop cap to open, like the first page of a novel.
 */

const SECTIONS = [
  {
    id: "introduction",
    title: "Introduction",
    body: `This Privacy Policy explains how we collect, use, and protect your information when you use this app. By using the app, you agree to the practices described in these pages.`,
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: `We collect account information such as your name and email address when you register or log in, content you add to your library or timetable, and usage data such as app interactions and crash reports that help us improve performance and reliability.`,
  },
  {
    id: "how-we-use-it",
    title: "How We Use Your Information",
    body: `We use the information we collect to provide core features such as your library, timetable, and profile, to maintain and improve the app, to communicate with you about updates or support, and to display relevant, non-personalized advertising through our partners.`,
  },
  {
    id: "advertising",
    title: "Advertising",
    body: `This app displays banner and rewarded video ads through third-party ad networks. These networks may collect device identifiers and usage data to serve and measure ads. You can typically manage ad personalization through your device settings.`,
  },
  {
    id: "data-sharing",
    title: "Data Sharing",
    body: `We do not sell your personal information. We may share limited data with service providers such as hosting, analytics, and advertising partners, solely to operate and improve the app, and only to the extent necessary for them to perform their services.`,
  },
  {
    id: "data-security",
    title: "Data Storage & Security",
    body: `Your data is stored using industry-standard practices. While we take reasonable steps to protect your information, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    id: "your-choices",
    title: "Your Choices",
    body: `You can review, update, or delete your account information at any time from your profile. Many features of the app are also available offline without an account, in which case less data is collected.`,
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    body: `This app is not directed at children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us so we can remove it.`,
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. Changes are reflected by an updated "Last revised" date on the cover page. Continued use of the app after changes take effect means you accept the revised policy.`,
  },
  {
    id: "contact",
    title: "Contact Us",
    body: `If you have questions about this Privacy Policy or how your data is handled, write to us at ucnodemailler@gmail.com.`,
  },
];

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export default function PrivacyPolicy() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const sectionRefs = useRef({});
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { root: containerRef.current, threshold: 0.5 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Source+Serif+4:wght@400;600&family=Inter:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }

        @media (prefers-reduced-motion: reduce) {
          * { scroll-behavior: auto !important; transition: none !important; }
        }

        .pp-scroll { scroll-behavior: smooth; }
        .pp-scroll::-webkit-scrollbar { width: 8px; }
        .pp-scroll::-webkit-scrollbar-thumb { background: #C8B99C; border-radius: 4px; }
        .pp-scroll::-webkit-scrollbar-track { background: transparent; }

        .pp-toc-item:focus-visible,
        .pp-link:focus-visible {
          outline: 2px solid #B08D57;
          outline-offset: 3px;
        }

        .pp-dropcap::first-letter {
          font-family: 'Fraunces', serif;
          font-size: 3.6rem;
          font-weight: 600;
          float: left;
          line-height: 0.8;
          padding-right: 0.35rem;
          padding-top: 0.1rem;
          color: #6B4226;
        }
      `}</style>

      <div style={styles.book}>
        {/* SPINE / INDEX */}
        <aside style={styles.spine}>
          <div style={styles.spineTop}>
            <span style={styles.spineMark}>📖</span>
            <h1 style={styles.spineTitle}>Privacy Policy</h1>
            <p style={styles.spineSubtitle}>Last revised · 13 July 2026</p>
          </div>

          <nav aria-label="Table of contents" style={styles.toc}>
            {SECTIONS.map((s, i) => {
              const active = activeId === s.id;
              return (
                <button
                  key={s.id}
                  className="pp-toc-item"
                  onClick={() => scrollTo(s.id)}
                  style={{
                    ...styles.tocItem,
                    ...(active ? styles.tocItemActive : {}),
                  }}
                >
                  <span
                    style={{
                      ...styles.tocRoman,
                      color: active ? "#E7DCC4" : "#8C7A5C",
                    }}
                  >
                    {ROMAN[i]}
                  </span>
                  <span>{s.title}</span>
                </button>
              );
            })}
          </nav>

          <p style={styles.spineFooter}>
            Questions? <br />
            ucnodemailler@gmail.com
          </p>
        </aside>

        {/* PAGE */}
        <main className="pp-scroll" ref={containerRef} style={styles.pageBody}>
          <div style={styles.pageInner}>
            <header style={styles.pageHeader}>
              <p style={styles.eyebrow}>Bookstore App · Reader Agreement</p>
              <h2 style={styles.pageTitle}>Your Privacy Matters</h2>
              <p style={styles.pageIntro}>
                A short, plain-language account of what we collect, why, and
                what stays entirely yours — chapter by chapter.
              </p>
            </header>

            {SECTIONS.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                ref={(el) => (sectionRefs.current[s.id] = el)}
                style={styles.section}
              >
                <div style={styles.sectionHeading}>
                  <span style={styles.sectionRoman}>{ROMAN[i]}</span>
                  <h3 style={styles.sectionTitle}>{s.title}</h3>
                </div>
                <p
                  className={i === 0 ? "pp-dropcap" : undefined}
                  style={styles.sectionBody}
                >
                  {s.body}
                </p>
              </section>
            ))}

            <footer style={styles.pageFooter}>
              <div style={styles.footerRule} />
              <p style={styles.footerText}>
                Thank you for reading to the last page.
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#EDE3D0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    fontFamily: "'Inter', sans-serif",
  },
  book: {
    width: "100%",
    maxWidth: "980px",
    height: "min(860px, 90vh)",
    display: "flex",
    borderRadius: "6px",
    overflow: "hidden",
    boxShadow:
      "0 30px 60px -20px rgba(43,38,32,0.35), 0 2px 0 rgba(255,255,255,0.4) inset",
    background: "#FBF7EE",
  },
  spine: {
    width: "260px",
    minWidth: "260px",
    background:
      "linear-gradient(160deg, #4A3221 0%, #5C3D26 55%, #4A3221 100%)",
    color: "#EDE3D0",
    padding: "32px 22px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  spineTop: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  spineMark: {
    fontSize: "22px",
    marginBottom: "6px",
  },
  spineTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: "22px",
    lineHeight: 1.15,
    margin: 0,
    color: "#F6EEDD",
  },
  spineSubtitle: {
    fontSize: "12px",
    color: "#C8B99C",
    margin: 0,
    letterSpacing: "0.02em",
  },
  toc: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    marginTop: "28px",
    flex: 1,
    overflowY: "auto",
  },
  tocItem: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    background: "transparent",
    border: "none",
    color: "#D8C9AA",
    fontFamily: "'Source Serif 4', serif",
    fontSize: "13.5px",
    textAlign: "left",
    padding: "8px 8px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  tocItemActive: {
    background: "rgba(237,227,208,0.12)",
    color: "#F6EEDD",
    fontWeight: 600,
  },
  tocRoman: {
    fontFamily: "'Fraunces', serif",
    fontSize: "12px",
    width: "18px",
    flexShrink: 0,
  },
  spineFooter: {
    fontSize: "11px",
    color: "#B7A582",
    lineHeight: 1.5,
    marginTop: "20px",
    borderTop: "1px solid rgba(237,227,208,0.15)",
    paddingTop: "14px",
  },
  pageBody: {
    flex: 1,
    overflowY: "auto",
    background: "#FBF7EE",
    backgroundImage:
      "radial-gradient(rgba(107,66,38,0.05) 1px, transparent 1px)",
    backgroundSize: "18px 18px",
  },
  pageInner: {
    padding: "48px 56px 64px",
    maxWidth: "620px",
  },
  pageHeader: {
    marginBottom: "36px",
  },
  eyebrow: {
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#B08D57",
    fontWeight: 600,
    margin: "0 0 10px",
  },
  pageTitle: {
    fontFamily: "'Fraunces', serif",
    fontStyle: "italic",
    fontWeight: 600,
    fontSize: "34px",
    color: "#2B2620",
    margin: "0 0 12px",
    lineHeight: 1.15,
  },
  pageIntro: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: "15px",
    color: "#6B6255",
    lineHeight: 1.6,
    margin: 0,
  },
  section: {
    marginBottom: "34px",
    scrollMarginTop: "24px",
  },
  sectionHeading: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    marginBottom: "10px",
  },
  sectionRoman: {
    fontFamily: "'Fraunces', serif",
    fontSize: "13px",
    color: "#B08D57",
    fontWeight: 600,
  },
  sectionTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: "18px",
    color: "#2B2620",
    margin: 0,
  },
  sectionBody: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: "15px",
    lineHeight: 1.75,
    color: "#413A2E",
    margin: 0,
  },
  pageFooter: {
    marginTop: "48px",
  },
  footerRule: {
    height: "1px",
    background:
      "linear-gradient(to right, transparent, #C8B99C, transparent)",
    marginBottom: "16px",
  },
  footerText: {
    fontFamily: "'Fraunces', serif",
    fontStyle: "italic",
    fontSize: "13px",
    color: "#8C7A5C",
    textAlign: "center",
    margin: 0,
  },
};