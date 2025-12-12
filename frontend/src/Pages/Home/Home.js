// src/Pages/Home/Home.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container } from "react-bootstrap";
import "./home.css";
import { addTransaction, getTransactions } from "../../utils/ApiRequest";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
import Analytics from "./Analytics";

const Home = () => {
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  const [cUser, setcUser] = useState();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");
  const [plannedSavings, setPlannedSavings] = useState(0);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleStartChange = (date) => setStartDate(date);
  const handleEndChange = (date) => setEndDate(date);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userString);
      setcUser(user);

      if (user.isAvatarImageSet === false || user.avatarImage === "") {
        navigate("/setAvatar", { replace: true });
        return;
      }

      setRefresh(true);
    } catch (error) {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // read planned savings from BudgetPage
  useEffect(() => {
    const saved = localStorage.getItem("plannedSavings");
    if (saved) {
      setPlannedSavings(Number(saved) || 0);
    }
  }, []);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleChangeFrequency = (e) => setFrequency(e.target.value);
  const handleSetType = (e) => setType(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        userId: cUser._id,
      });

      if (data.success === true) {
        toast.success(data.message, toastOptions);

      if (data.warningAlert) {
        toast.info(data.warningAlertMessage, toastOptions);
        }
  // NEW: hard limit crossed
      if (data.budgetAlert) {
         toast.warning(data.budgetAlertMessage, toastOptions);
         }
        handleClose();
        setValues({
          title: "",
          amount: "",
          description: "",
          category: "",
          date: "",
          transactionType: "",
        });
        setRefresh(!refresh);
      } else {
        toast.error(data.message, toastOptions);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setType("all");
    setStartDate(null);
    setEndDate(null);
    setFrequency("7");
  };

  useEffect(() => {
    if (!cUser?._id) return;

    const fetchAllTransactions = async () => {
      try {
        setLoading(true);
        const { data } = await axios.post(getTransactions, {
          userId: cUser._id,
          frequency,
          startDate,
          endDate,
          type,
        });
        setTransactions(data.transactions || []);
      } catch (err) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTransactions();
  }, [refresh, frequency, endDate, type, startDate, cUser]);

  const handleTableClick = () => setView("table");
  const handleChartClick = () => setView("chart");

  const baseIncome = transactions
    .filter((t) => t.transactionType === "credit")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalIncome = baseIncome + plannedSavings;

  const totalExpense = transactions
    .filter((t) => t.transactionType === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Container className="mt-3">
          {/* DASHBOARD HEADER + ADD BUTTON */}
          <div className="dash-header">
            <div>
              <h2 className="dash-title">Expense Dashboard</h2>
              <p className="dash-subtitle">
                Track and manage all your expenses in one place.
              </p>
            </div>
            <button className="dash-add-btn" onClick={handleShow}>
              + Add Expense
            </button>
          </div>

          {/* SUMMARY CARDS */}
          <div className="dash-cards">
            <div className="dash-card">
              <span className="dash-card-label">Total Income</span>
              <span className="dash-card-value">
                ₹{totalIncome.toFixed(2)}
              </span>
            </div>
            <div className="dash-card">
              <span className="dash-card-label">Total Expense</span>
              <span className="dash-card-value">
                ₹{totalExpense.toFixed(2)}
              </span>
            </div>
            <div className="dash-card">
              <span className="dash-card-label">Balance</span>
              <span className="dash-card-value">₹{balance.toFixed(2)}</span>
            </div>
          </div>

          {/* FILTERS + VIEW TOGGLE */}
          <div className="filterRow">
            <div>
              <Form.Group className="mb-3" controlId="formSelectFrequency">
                <Form.Label>Select Frequency</Form.Label>
                <Form.Select
                  name="frequency"
                  value={frequency}
                  onChange={handleChangeFrequency}
                >
                  <option value="7">Last Week</option>
                  <option value="30">Last Month</option>
                  <option value="365">Last Year</option>
                  <option value="custom">Custom</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="type">
              <Form.Group className="mb-3" controlId="formSelectType">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={type}
                  onChange={handleSetType}
                >
                  <option value="all">All</option>
                  <option value="expense">Expense</option>
                  <option value="credit">Earned</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="iconBtnBox">
              <FormatListBulletedIcon
                sx={{ cursor: "pointer" }}
                onClick={handleTableClick}
                className={view === "table" ? "iconActive" : "iconDeactive"}
              />
              <BarChartIcon
                sx={{ cursor: "pointer" }}
                onClick={handleChartClick}
                className={view === "chart" ? "iconActive" : "iconDeactive"}
              />
            </div>
          </div>

          {/* CUSTOM DATE RANGE */}
          {frequency === "custom" && (
            <div className="date">
              <div className="form-group">
                <label htmlFor="startDate">Start Date:</label>
                <div>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date:</label>
                <div>
                  <DatePicker
                    selected={endDate}
                    onChange={handleEndChange}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="containerBtn">
            <Button variant="primary" onClick={handleReset}>
              Reset Filter
            </Button>
          </div>

          {/* EXPENSE LIST TITLE */}
          <h3 className="dash-expenses-title">
            Expenses ({transactions.length})
          </h3>

          {/* EXPENSE LIST */}
          <div className="dash-expense-list">
            {transactions.map((tx) => (
              <div key={tx._id} className="dash-expense-row">
                <div className="dash-expense-main">
                  <div className="dash-expense-title">{tx.title}</div>
                  <div className="dash-expense-meta">
                    <span className="dash-expense-category">
                      {tx.category}
                    </span>
                    <span className="dash-expense-date">
                      {tx.date
                        ? new Date(tx.date).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
                <div
                  className={`dash-expense-amount ${
                    tx.transactionType === "expense"
                      ? "negative"
                      : "positive"
                  }`}
                >
                  ₹{Number(tx.amount || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* TABLE / ANALYTICS */}
          {view === "table" ? (
            <TableData data={transactions} user={cUser} />
          ) : (
            <Analytics transactions={transactions} user={cUser} />
          )}

          {/* ADD / EDIT MODAL */}
          <Modal show={show} onHide={handleClose} centered>
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
                  <option value="Maintenance & Society Charges">
                       Maintenance & Society Charges
                 </option>
                 <option value="Electricity & Water">Electricity & Water</option>
                 <option value="LPG / Cooking Gas">LPG / Cooking Gas</option>
                 <option value="Mobile & Internet">Mobile & Internet</option>
                 <option value="Education & Fees">Education & Fees</option>
                 <option value="Medical & Pharmacy">Medical & Pharmacy</option>
                 <option value="Insurance (Life/Health)">Insurance (Life/Health)</option>
                 <option value="Local Transport">Local Transport</option>
                 <option value="Fuel & Vehicle Running">Fuel & Vehicle Running</option>
                 <option value="Eating Out & Restaurants">
                  Eating Out & Restaurants
                </option>
                <option value="Entertainment & Subscriptions">
                 Entertainment & Subscriptions
                </option>
                <option value="Clothing & Footwear">Clothing & Footwear</option>
                <option value="Household Items & Appliances">
                   Household Items & Appliances
                </option>
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
        </Container>
      )}
    </>
  );
};

export default Home;
