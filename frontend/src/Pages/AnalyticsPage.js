
// src/Pages/AnalyticsPage.js
import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { getTransactions } from "../utils/ApiRequest";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./analytics.css";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const AnalyticsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    pauseOnHover: false,
    theme: "dark",
  };

  
  const fetchTransactions = async (userId) => {
    try {
      setLoading(true);
      const { data } = await axios.post(getTransactions, {
        userId,
        frequency: "365",
        type: "all",
      });
      setTransactions(data.transactions || []);
    } catch (err) {
      toast.error("Failed to load analytics data", toastOptions);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) return;

    try {
      const u = JSON.parse(userString);
      fetchTransactions(u._id);
    } catch {
      localStorage.removeItem("user");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const totalSpent = transactions
    .filter((t) => t.transactionType === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalIncome = transactions
    .filter((t) => t.transactionType === "credit")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const txCount = transactions.length;
  const avgAmount =
    txCount > 0 ? (totalSpent + totalIncome) / txCount : 0;

  // ----- Monthly Trend data (expenses per month) -----
  const expenseByMonth = transactions
    .filter((t) => t.transactionType === "expense" && t.date)
    .reduce((acc, t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`; // e.g. 2025-03
      acc[key] = (acc[key] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

  const monthKeys = Object.keys(expenseByMonth).sort();

  const monthLabels = monthKeys.map((k) => {
    const [year, m] = k.split("-");
    const names = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${names[Number(m) - 1]} ${year.slice(2)}`; // e.g. Mar 25
  });

  const monthValues = monthKeys.map((k) => expenseByMonth[k]);

  // ----- Pie: spending by category (expenses only) -----
  const expenseByCategory = transactions
    .filter((t) => t.transactionType === "expense")
    .reduce((acc, t) => {
      const key = t.category || "Other";
      acc[key] = (acc[key] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

  const pieLabels = Object.keys(expenseByCategory);
  const pieValues = Object.values(expenseByCategory);

  const pieColors = [
    "#16a34a",
    "#22c55e",
    "#4ade80",
    "#86efac",
    "#bbf7d0",
    "#15803d",
  ];

  const pieData = {
    labels: pieLabels,
    datasets: [
      {
        data: pieValues,
        backgroundColor: pieValues.map(
          (_, i) => pieColors[i % pieColors.length]
        ),
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 18,
          boxHeight: 18,
        },
      },
    },
    maintainAspectRatio: false,
  };

  // different green shades per month
  const colors = [
    "#16a34a",
    "#22c55e",
    "#4ade80",
    "#86efac",
    "#15803d",
    "#166534",
  ];

  const monthData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Total Expense",
        data: monthValues,
        backgroundColor: monthValues.map(
          (_, i) => colors[i % colors.length]
        ),
      },
    ],
  };

  const monthOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const categoryStats = transactions.reduce((acc, t) => {
    const key = t.category || "Other";
    if (!acc[key]) {
      acc[key] = { spent: 0, count: 0 };
    }
    const amt = Number(t.amount || 0);
    if (t.transactionType === "expense") {
      acc[key].spent += amt;
    }
    acc[key].count += 1;
    return acc;
  }, {});

  return (
    <Container className="analytics-page mt-3">
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Analytics &amp; Insights</h2>
          <p className="analytics-subtitle">
            Visualize your spending patterns and track your financial health.
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="analytics-cards">
        <div className="analytics-card">
          <span className="analytics-card-label">Total Spent</span>
          <span className="analytics-card-value">
            ₹{totalSpent.toFixed(2)}
          </span>
        </div>
        <div className="analytics-card">
          <span className="analytics-card-label">
            Total Transactions
          </span>
          <span className="analytics-card-value">{txCount}</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-card-label">Average Amount</span>
          <span className="analytics-card-value">
            ₹{avgAmount.toFixed(2)}
          </span>
        </div>
        <div className="analytics-card">
          <span className="analytics-card-label">Total Income</span>
          <span className="analytics-card-value">
            ₹{totalIncome.toFixed(2)}
          </span>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="analytics-grid">
        {/* LEFT: pie chart - spending by category */}
        <div className="analytics-panel">
          <h4 className="panel-title">Spending by Category</h4>
          {loading ? (
            <p className="panel-placeholder">Loading…</p>
          ) : pieLabels.length === 0 ? (
            <p className="panel-placeholder">No expense data.</p>
          ) : (
            <div className="pie-wrapper">
              <Pie data={pieData} options={pieOptions} />
            </div>
          )}
        </div>

        {/* RIGHT: Monthly Trend bar chart */}
        <div className="analytics-panel">
          <h4 className="panel-title">Monthly Trend</h4>
          {loading ? (
            <p className="panel-placeholder">Loading…</p>
          ) : monthLabels.length === 0 ? (
            <p className="panel-placeholder">No monthly data.</p>
          ) : (
            <Bar data={monthData} options={monthOptions} />
          )}
        </div>
      </div>

      {/* CATEGORY BREAKDOWN TABLE */}
      <div className="analytics-panel mt-3">
        <h4 className="panel-title">Category Breakdown</h4>
        <div className="table-responsive">
          <table className="table analytics-table mb-0">
            <thead>
              <tr>
                <th>Category</th>
                <th>Expenses</th>
                <th>Total Spent (₹)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(categoryStats).length === 0 && (
                <tr>
                  <td colSpan="3" className="text-muted">
                    No data available.
                  </td>
                </tr>
              )}
              {Object.entries(categoryStats).map(([cat, info]) => (
                <tr key={cat}>
                  <td>{cat}</td>
                  <td>{info.count}</td>
                  <td>₹{info.spent.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer />
    </Container>
  );
};

export default AnalyticsPage;