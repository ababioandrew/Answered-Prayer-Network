import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

// Import the APN icon
import APNIcon from "../icons/APN.png";

export default function Navbar() {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/services", label: "Ministries" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* ================================
          MAIN NAVBAR
      ================================= */}
      <header className="navbar">
        <div className="navbar-inner">

          {/* Mobile Menu Button */}
          <div className="navbar-left">
            <button
              type="button"
              className="hamburger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          {/* Church Logo / Brand */}
          <Link to="/" className="navbar-logo" aria-label="Answered Prayer Network home">
            <div className="logo-mark">
              {/* ✅ Use APN icon */}
              <img src={APNIcon} alt="Answered Prayer Network Logo" className="logo-icon" />
            </div>
            <div className="logo-text">
              <span className="logo-brand">Answered Prayer Network</span>
              <span className="logo-sub">FAITH • HOPE • LOVE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="navbar-nav" aria-label="Main navigation">
            <ul className="navbar-links">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`nav-link ${isActive(link.to) ? "active" : ""}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* ================================
          MOBILE DRAWER BACKDROP
      ================================= */}
      <div
        className={`drawer-backdrop ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* ================================
          MOBILE DRAWER
      ================================= */}
      <aside className={`drawer ${drawerOpen ? "open" : ""}`}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <Link to="/" className="drawer-logo" onClick={() => setDrawerOpen(false)}>
            <div className="logo-mark">
              {/* ✅ APN icon again */}
              <img src={APNIcon} alt="Answered Prayer Network Logo" className="logo-icon" />
            </div>
            <div className="logo-text">
              <span className="logo-brand">Answered Prayer Network</span>
              <span className="logo-sub">FAITH • HOPE • LOVE</span>
            </div>
          </Link>

          <button
            type="button"
            className="drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        <div className="drawer-rule" />

        {/* Mobile Navigation */}
        <nav className="drawer-nav">
          <ul>
            {links.map((link, index) => (
              <li key={link.to} style={{ animationDelay: `${index * 60}ms` }}>
                <Link
                  to={link.to}
                  className={`drawer-link ${isActive(link.to) ? "active" : ""}`}
                  onClick={() => setDrawerOpen(false)}
                >
                  <span className="drawer-link-label">{link.label}</span>
                  <span className="drawer-link-arrow">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <p className="drawer-footer-label">WELCOME</p>
          <p className="drawer-footer-text">
            We welcome you to worship, fellowship,
            grow in faith, and serve together.
          </p>
          <Link
            to="/contact"
            className="btn-gold drawer-cta"
            onClick={() => setDrawerOpen(false)}
          >
            Contact Us
          </Link>
        </div>
      </aside>
    </>
  );
}
