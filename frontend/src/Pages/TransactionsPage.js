// src/Pages/TransactionsPage.js
import React, { useState, useEffect } from "react";
import TableData from "./Home/TableData";
import { getTransactions, addTransaction } from "../utils/ApiRequest";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Button, Modal, Form } from "react-bootstrap";
import "./Transactions.css";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("all"); // all / credit / expense

  const [showAddTx, setShowAddTx] = useState(false);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    pauseOnHover: false,
    theme: "dark",
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleClose = () => setShowAddTx(false);
  const handleShow = () => setShowAddTx(true);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) return;

    try {
      const u = JSON.parse(userString);
      setUser(u);
      fetchTransactions(u._id);
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

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
      toast.error("Failed to load transactions", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?._id) return;

    const { title, amount, description, category, date, transactionType } =
      values;

    if (!title || !amount || !description || !category || !date || !transactionType) {
      toast.error("Please enter all the fields", toastOptions);
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(addTransaction, {
        title,
        amount,
        description,
        category,
        date,
        transactionType,
        userId: user._id,
      });

      if (data.success === true) {
        toast.success(data.message, toastOptions);
        handleClose();
        setValues({
          title: "",
          amount: "",
          description: "",
          category: "",
          date: "",
          transactionType: "",
        });
        fetchTransactions(user._id); // refresh table
      } else {
        toast.error(data.message, toastOptions);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter((t) =>
    type === "all" ? true : t.transactionType === type
  );

  return (
    <div>
      {/* HEADER + ACTION BUTTONS */}
      <div className="tx-header">
        <div>
          <h3 className="tx-title">Income &amp; Expense</h3>
        </div>

        <div className="tx-actions">
          <button className="btn-add-expense" onClick={handleShow}>
            + Add Expense
          </button>
        </div>
      </div>

      {/* FILTER ROW */}
      <div className="tx-filter-row">
        <label style={{ marginRight: 8 }}>Filter:</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: "4px 8px" }}
        >
          <option value="all">All</option>
          <option value="credit">Income only</option>
          <option value="expense">Expense only</option>
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <TableData data={filtered} user={user} />
      )}

      {/* ADD EXPENSE MODAL (same style as Home) */}
      <Modal show={showAddTx} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                name="title"
                type="text"
                placeholder="Enter expense title"
                value={values.title}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formAmount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                name="amount"
                type="number"
                placeholder="Enter amount"
                value={values.amount}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCategory">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={values.category}
                onChange={handleChange}
              >
               <option value="">Select category</option>
               <option value="Groceries & Vegetables">Groceries & Vegetables</option>
               <option value="Milk & Dairy">Milk & Dairy</option>
               <option value="House Rent / Home EMI">House Rent / Home EMI</option>
               <option value="Maintenance & Society Charges">Maintenance & Society Charges</option>
               <option value="Electricity & Water">Electricity & Water</option>
               <option value="LPG / Cooking Gas">LPG / Cooking Gas</option>
               <option value="Mobile & Internet">Mobile & Internet</option>
               <option value="Education & Fees">Education & Fees</option>
               <option value="Medical & Pharmacy">Medical & Pharmacy</option>
               <option value="Insurance (Life/Health)">Insurance (Life/Health)</option>
               <option value="Local Transport">Local Transport</option>
               <option value="Fuel & Vehicle Running">Fuel & Vehicle Running</option>
               <option value="Eating Out & Restaurants">Eating Out & Restaurants</option>
               <option value="Entertainment & Subscriptions">Entertainment & Subscriptions</option>
               <option value="Clothing & Footwear">Clothing & Footwear</option>
               <option value="Household Items & Appliances">Household Items & Appliances</option>
               <option value="EMIs & Other Loans">EMIs & Other Loans</option>
               <option value="Savings & Investments">Savings & Investments</option>
               <option value="Miscellaneous / Others">Miscellaneous / Others</option>
            </Form.Select>
          </Form.Group>

            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                placeholder="Enter description"
                value={values.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formType">
              <Form.Label>Transaction Type</Form.Label>
              <Form.Select
                name="transactionType"
                value={values.transactionType}
                onChange={handleChange}
              >
                <option value="">Select type</option>
                <option value="credit">Income</option>
                <option value="expense">Expense</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={values.date}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Expense
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default TransactionsPage;
