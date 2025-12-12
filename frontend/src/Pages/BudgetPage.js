// src/Pages/BudgetPage.js
import React, { useState } from "react";
import "./BudgetPage.css";
import axios from "axios";
import { addTransaction } from "../utils/ApiRequest"; // adjust path if needed

const BudgetPage = () => {
  const [persons, setPersons] = useState("");
  const [budget, setBudget] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationType, setDurationType] = useState("days");
  const [result, setResult] = useState(null);

  const handleCalculate = async (e) => {
    e.preventDefault();

    const p = Number(persons);
    const b = Number(budget);
    const d = Number(durationValue);

    if (!p || !b || !d || p <= 0 || b <= 0 || d <= 0) {
      alert("Please enter valid positive values.");
      return;
    }

    // convert months / years to days (simple approx)
    let totalDays = d;
    if (durationType === "months") totalDays = d * 30;
    if (durationType === "years") totalDays = d * 365;

    const perDayTotal = b / totalDays;
    const perPersonPerDay = perDayTotal / p;

    // fixed saving percent for all months
    const savePercent = 20; // 20% of total budget
    const savingsAmount = (b * savePercent) / 100;
    const safeBudget = b - savingsAmount;
    const safePerPersonPerDay = safeBudget / (p * totalDays);

    const categories = [
      { name: "Food", percent: 40 },
      { name: "Travel", percent: 20 },
      { name: "Shopping", percent: 15 },
      { name: "Bills", percent: 15 },
      { name: "Others", percent: 10 },
    ];

    const categoryBreakdown = categories.map((c) => ({
      name: c.name,
      perDay: (perDayTotal * c.percent) / 100,
      perPersonPerDay: (perPersonPerDay * c.percent) / 100,
    }));

    setResult({
      totalDays,
      perDayTotal,
      perPersonPerDay,
      categoryBreakdown,
      savePercent,
      savingsAmount,
      safePerPersonPerDay,
    });

    // Option 2: also record this as a real "Savings" income transaction
    try {
      const userString = localStorage.getItem("user");
      if (!userString) return;
      const user = JSON.parse(userString);

      await axios.post(addTransaction, {
        title: "Planned Savings",
        amount: savingsAmount,
        description: "Auto-added from Budget Planner",
        category: "Savings",
        date: new Date(),
        transactionType: "credit",
        userId: user._id,
      });
    } catch (err) {
      console.error("Failed to create savings transaction", err);
    }
  };

  return (
    <div className="budget-page">
      <div className="budget-shell">
        <h2 className="budget-title">Budget Planner</h2>

        <form className="budget-form" onSubmit={handleCalculate}>
          <div className="form-row">
            <label>No. of persons</label>
            <input
              type="number"
              min="1"
              value={persons}
              onChange={(e) => setPersons(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>

          <div className="form-row">
            <label>Total budget (₹)</label>
            <input
              type="number"
              min="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 15000"
            />
          </div>

          <div className="form-row form-row-inline">
            <div>
              <label>Duration</label>
              <input
                type="number"
                min="1"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <label>Type</label>
              <select
                value={durationType}
                onChange={(e) => setDurationType(e.target.value)}
              >
                <option value="days">Days</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>

          <button type="submit" className="budget-btn">
            Calculate
          </button>
        </form>

        {result && (
          <div className="budget-result">
            <h3>Summary</h3>
            <p>
              Total days considered: <strong>{result.totalDays}</strong>
            </p>
            <p>
              Budget per day (all persons):{" "}
              <strong>₹{result.perDayTotal.toFixed(2)}</strong>
            </p>
            <p>
              Budget per person per day:{" "}
              <strong>₹{result.perPersonPerDay.toFixed(2)}</strong>
            </p>

            {/* savings info */}
            <p>
              Saving {result.savePercent}% of your budget:{" "}
              <strong>₹{result.savingsAmount.toFixed(2)}</strong>
            </p>
            <p>
              If you want to save this, spend only{" "}
              <strong>₹{result.safePerPersonPerDay.toFixed(2)}</strong> per
              person per day.
            </p>

            <h3>Suggested category limit per day</h3>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Per day (total)</th>
                  <th>Per person / day</th>
                </tr>
              </thead>
              <tbody>
                {result.categoryBreakdown.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td>₹{c.perDay.toFixed(2)}</td>
                    <td>₹{c.perPersonPerDay.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="budget-hint">
              Try to keep each person&apos;s spending for every category within
              these amounts so you can finish all days inside your budget and
              still save {result.savePercent}%.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetPage;
