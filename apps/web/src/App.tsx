import { FormEvent, useEffect, useState } from "react";
import { useTestData } from "./hooks";
import { ChatPage, DashboardPage, LandlordsPage, ReviewsPage, ToletPage } from "./pages";
import type { PageId } from "./pages/types";
import { useAuthSession } from "./auth";

const pages = [
  { id: "dashboard", label: "Dashboard" },
  { id: "landlords", label: "Landlords" },
  { id: "reviews", label: "Reviews" },
  { id: "tolet", label: "To-let" }
] as const;

export function App() {
  const { data: testData, loading, error } = useTestData();
  const { session, ready: authReady, login, logout, register } = useAuthSession();
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [roleInput, setRoleInput] = useState<"TENANT" | "CUSTOMER">("CUSTOMER");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = menuOpen || chatOpen || authModalOpen ? "hidden" : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [authModalOpen, chatOpen, menuOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setChatOpen(false);
        setAuthModalOpen(false);
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
    if (activePage === "reviews") {
      return (
        <ReviewsPage
          session={session}
          onRequireAuth={() => {
            setAuthMode("login");
            setAuthModalOpen(true);
          }}
        />
      );
    }
    if (activePage === "tolet") {
      return (
        <ToletPage
          session={session}
          onRequireAuth={() => {
            setAuthMode("register");
            setAuthModalOpen(true);
          }}
        />
      );
    }

    return null;
  };

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthStatus(null);

    try {
      if (authMode === "register") {
        await register({
          name: nameInput,
          email: emailInput,
          password: passwordInput,
          role: roleInput
        });
        setAuthStatus("Account created and logged in.");
        setAuthModalOpen(false);
      } else {
        await login({ email: emailInput, password: passwordInput });
        setAuthStatus("Logged in successfully.");
        setAuthModalOpen(false);
      }

      setPasswordInput("");
    } catch (error) {
      setAuthStatus(error instanceof Error ? error.message : "Authentication failed.");
    }
  }

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

      <div className="nav-row">
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

        <div className="nav-auth-area">
          {authReady ? (
            session ? (
              <div className="auth-summary-inline">
                <span className="badge badge-dark">{session.user.role}</span>
                <span className="surface-note">{session.user.name}</span>
                <button type="button" className="ghost-button" onClick={() => logout()}>
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="ghost-button nav-auth-trigger"
                onClick={() => {
                  setAuthMode("login");
                  setAuthModalOpen(true);
                }}
              >
                Login / Sign up
              </button>
            )
          ) : null}
        </div>
      </div>

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

      {authModalOpen ? (
        <div className="auth-modal-wrap" role="dialog" aria-modal="true" aria-label="Login and sign up">
          <button
            type="button"
            className="auth-modal-backdrop"
            aria-label="Close authentication"
            onClick={() => setAuthModalOpen(false)}
          />
          <section className="auth-modal card">
            <div className="section-header">
              <div>
                <span className="eyebrow">Account access</span>
                <h2>{authMode === "register" ? "Create your account" : "Welcome back"}</h2>
              </div>
              <button type="button" className="chat-close" onClick={() => setAuthModalOpen(false)} aria-label="Close">
                ×
              </button>
            </div>

            <form className="stacked-form" onSubmit={handleAuthSubmit}>
              <div className="auth-mode-toggle auth-mode-toggle-modal">
                <button
                  type="button"
                  className={authMode === "login" ? "auth-mode-button auth-mode-button-active" : "auth-mode-button"}
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={authMode === "register" ? "auth-mode-button auth-mode-button-active" : "auth-mode-button"}
                  onClick={() => setAuthMode("register")}
                >
                  Sign up
                </button>
              </div>

              {authMode === "register" ? (
                <div>
                  <label htmlFor="auth-name">Name</label>
                  <input
                    id="auth-name"
                    type="text"
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              ) : null}

              <div>
                <label htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </div>

              {authMode === "register" ? (
                <div>
                  <label htmlFor="auth-role">Account type</label>
                  <select id="auth-role" value={roleInput} onChange={(event) => setRoleInput(event.target.value as "TENANT" | "CUSTOMER") }>
                    <option value="CUSTOMER">Customer (write reviews)</option>
                    <option value="TENANT">Tenant (post to-let)</option>
                  </select>
                </div>
              ) : null}

              <button type="submit">{authMode === "register" ? "Create account" : "Login"}</button>
            </form>

            {authStatus ? <p className="surface-note">{authStatus}</p> : null}
          </section>
        </div>
      ) : null}

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
