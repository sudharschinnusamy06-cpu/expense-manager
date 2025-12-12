// src/Pages/Auth/Register.js
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "./auth.css";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerAPI } from "../../utils/ApiRequest";
import axios from "axios";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("user")) {
      window.location.href = "/home";
    }
  }, []);

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "colored",
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password } = values;
    if (!name || !email || !password) {
      toast.error("Please fill all fields", toastOptions);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(registerAPI, { name, email, password });

      if (data.success === true) {
        toast.success(data.message || "Registration successful", toastOptions);
        setTimeout(() => {
          navigate("/login");
        }, 700);
      } else {
        toast.error(data.message || "Registration failed", toastOptions);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <Container className="login-container">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <div className="login-card">
              <div className="login-logo">
                <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />
                <span>SpendWise</span>
              </div>
              <h2 className="login-title">Create an account</h2>
              <p className="login-subtitle">
                Sign up to start tracking your income and expenses.
              </p>

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicName" className="mt-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={values.name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="formBasicEmail" className="mt-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={values.email}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={values.password}
                    onChange={handleChange}
                  />
                </Form.Group>

                <div className="login-extra" />

                <Button
                  type="submit"
                  className="login-btn mt-2"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Sign up"}
                </Button>

                <p className="login-footer-text">
                  Already have an account?{" "}
                  <Link to="/login" className="login-link">
                    Login
                  </Link>
                </p>
              </Form>
            </div>
          </Col>
        </Row>
        <ToastContainer />
      </Container>
    </div>
  );
};

export default Register;
