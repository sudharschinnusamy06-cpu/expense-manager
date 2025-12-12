// src/Pages/LimitationsPage.js
import React from "react";
import "./LimitationsPage.css";

const CATEGORY_LIMITS = [
  { category: "Groceries & Vegetables", limit: 8000 },
  { category: "Milk & Dairy", limit: 2000 },
  { category: "House Rent / Home EMI", limit: 10000 },
  { category: "Maintenance & Society Charges", limit: 1000 },
  { category: "Electricity & Water", limit: 1500 },
  { category: "LPG / Cooking Gas", limit: 1000 },
  { category: "Mobile & Internet", limit: 1000 },
  { category: "Education & Fees", limit: 50000 },
  { category: "Medical & Pharmacy", limit: 5000 },
  { category: "Insurance (Life/Health)", limit: 2500 },
  { category: "Local Transport", limit: 1500 },
  { category: "Fuel & Vehicle Running", limit: 3000 },
  { category: "Eating Out & Restaurants", limit: 2000 },
  { category: "Entertainment & Subscriptions", limit: 1000 },
  { category: "Clothing & Footwear", limit: 1500 },
  { category: "Household Items & Appliances", limit: 1500 },
  { category: "EMIs & Other Loans", limit: 3000 },
  { category: "Savings & Investments", limit: 0 },
  { category: "Miscellaneous / Others", limit: 1500 },
];


const LimitationsPage = () => {
  return (
    <div className="limit-shell">
      <div className="limit-card">
        <div className="limit-header">
          <h3>Default Monthly Limits</h3>
          <p>
            These are the warning limits used for email alerts when your monthly
            spending crosses the amount for each category.
          </p>
        </div>

        <div className="limit-table-wrapper">
          <table className="limit-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Limit per month (₹)</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_LIMITS.map((item) => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>
                    {item.limit === 0 ? "No limit (income)" : `₹${item.limit.toLocaleString("en-IN")}`}
                  </td>
                  <td>
                    {item.limit === 0
                      ? "Income categories are not restricted."
                      : "Alert is sent when this month’s total reaches or crosses this value."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="limit-footer-note">
          <p>
            Currently these limits are fixed for all users. In the next
            version, you will be able to customise them here per category.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LimitationsPage;
