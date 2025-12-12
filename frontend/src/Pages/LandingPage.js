import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="lp-root">
      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-left">
          <h1 className="lp-title">MASTER YOUR SPENDING</h1>
          <p className="lp-subtitle">
            Take control of your financial future with intelligent expense
            tracking and insightful analytics that help you save more and spend smarter.
          </p>
          <button
            className="lp-primary-btn"
            onClick={() => navigate("/login")}
          >
            Start Tracking Now →
          </button>
        </div>
        <div className="lp-hero-right">
          <div className="lp-monitor">
            {/* You can later replace this block with real dashboard preview */}
            <div className="lp-monitor-header" />
            <div className="lp-monitor-body">
              <div className="lp-pie" />
              <div className="lp-bars" />
            </div>
          </div>
        </div>
      </section>

      {/* Effortless tracking steps */}
      <section className="lp-steps">
        <h2 className="lp-section-title">EFFORTLESS TRACKING</h2>
        <p className="lp-section-sub">
          Get started in three simple steps and transform how you manage your money.
        </p>
        <div className="lp-steps-grid">
          <div className="lp-step-card">
            <div className="lp-step-circle">01</div>
            <h3>Log Your Expense</h3>
            <p>
              Quickly add expenses on the go with all the details you need.
            </p>
          </div>
          <div className="lp-step-card">
            <div className="lp-step-circle">02</div>
            <h3>Categorize &amp; Tag</h3>
            <p>
              Organize spending with custom categories and powerful filters.
            </p>
          </div>
          <div className="lp-step-card">
            <div className="lp-step-circle">03</div>
            <h3>Analyze &amp; Save</h3>
            <p>
              Use dashboard insights to identify savings opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="lp-features">
        <div className="lp-features-left">
          <h2 className="lp-section-title">POWERFUL FEATURES</h2>
          <p className="lp-section-sub">
            Everything you need to manage expenses efficiently and make
            informed financial decisions.
          </p>
        </div>
        <div className="lp-features-right">
          <div className="lp-feature-card">
            <div className="lp-icon-box">₹</div>
            <h3>Track Every Expense</h3>
            <p>Log each transaction with receipts, categories and payment methods.</p>
          </div>
          <div className="lp-feature-card">
            <div className="lp-icon-box">🔍</div>
            <h3>Smart Filtering &amp; Search</h3>
            <p>Find what you need by date, category, amount or description.</p>
          </div>
          <div className="lp-feature-card">
            <div className="lp-icon-box">📊</div>
            <h3>Visual Analytics</h3>
            <p>Understand spending patterns at a glance with clean charts.</p>
          </div>
          <div className="lp-feature-card">
            <div className="lp-icon-box">📈</div>
            <h3>Budget Insights</h3>
            <p>Monitor budgets in real-time and keep your goals on track.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <h2>READY TO TAKE CONTROL?</h2>
        <p>
          Join thousands of users managing their finances smarter. It&apos;s free to get started.
        </p>
        <button
          className="lp-secondary-btn"
          onClick={() => navigate("/login")}
        >
          Launch Dashboard →
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
