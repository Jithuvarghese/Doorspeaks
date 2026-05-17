import { useEffect, useState } from "react";
import { useTestData } from "./hooks";
import { ChatPage, DashboardPage, LandlordsPage, ReviewsPage, ToletPage } from "./pages";
import type { PageId } from "./pages/types";

const pages = [
  { id: "dashboard", label: "Dashboard" },
  { id: "landlords", label: "Landlords" },
  { id: "reviews", label: "Reviews" },
  { id: "tolet", label: "To-let" }
] as const;

export function App() {
  const { data: testData, loading, error } = useTestData();
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = menuOpen || chatOpen ? "hidden" : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [chatOpen, menuOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setChatOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigate = (page: PageId) => {
    setActivePage(page);
    setMenuOpen(false);
    setChatOpen(false);
  };

  const renderPage = () => {
    if (activePage === "dashboard") {
      if (loading) {
        return (
          <section className="hero hero-loading">
            <span className="eyebrow">DoorSpeaks</span>
            <h1>Preparing your tenant intelligence dashboard.</h1>
            <p>Loading verified landlord records, reviews, and rent benchmarks.</p>
          </section>
        );
      }

      if (error || !testData) {
        return (
          <section className="hero">
            <span className="eyebrow">DoorSpeaks</span>
            <h1>We could not load the test dataset.</h1>
            <p className="surface-note">Error: {error}. Make sure the API is running on port 4000.</p>
          </section>
        );
      }

      return <DashboardPage testData={testData} onNavigate={navigate} onOpenChat={() => setChatOpen(true)} />;
    }

    if (activePage === "landlords") return <LandlordsPage />;
    if (activePage === "reviews") return <ReviewsPage />;
    if (activePage === "tolet") return <ToletPage />;

    return null;
  };

  return (
    <main className="page shell">
      <header className="topbar">
        <div className="brand-block">
          <img className="brand-logo" src="/logo.png" alt="DoorSpeaks" />
          <div>
            <span className="eyebrow">DoorSpeaks</span>
            <h1>Tenant intelligence for Bangalore rentals.</h1>
          </div>
        </div>
        <div className="topbar-copy-wrap">
          <p className="topbar-copy">
            Know before you sign. Compare landlord behavior, deposit demands, and rental benchmarks in one place.
          </p>
        </div>
      </header>

      <button
        type="button"
        className="menu-toggle"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <nav className={menuOpen ? "app-nav app-nav-open" : "app-nav"} aria-label="Primary">
        <div className="nav-links">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              className={activePage === page.id ? "nav-button nav-button-active" : "nav-button"}
              onClick={() => navigate(page.id)}
            >
              {page.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="page-content">{renderPage()}</div>

      {chatOpen ? null : (
        <button
          type="button"
          className="chat-launcher-fixed"
          aria-label="Open AI assistant"
          onClick={() => setChatOpen(true)}
        >
          <span className="chat-launcher-emoji" aria-hidden="true">
            ✦
          </span>
          <span className="chat-launcher-text">AI chat</span>
        </button>
      )}

      <ChatPage open={chatOpen} onClose={() => setChatOpen(false)} />

      <footer className="site-footer">
        <div className="footer-brand">
          <img className="footer-logo" src="/logo.png" alt="DoorSpeaks" />
          <div>
            <strong>DoorSpeaks</strong>
            <p>Tenant-first rental transparency for Bangalore. Know before you sign.</p>
          </div>
        </div>
        <div className="footer-links">
          <span>Reviews</span>
          <span>To-let</span>
          <span>Deposit checker</span>
          <span>AI chat</span>
        </div>
      </footer>
    </main>
  );
}
