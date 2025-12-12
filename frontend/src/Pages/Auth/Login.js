// src/Pages/Auth/Login.js
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { loginAPI } from "../../utils/ApiRequest";
import "./auth.css"; // optional if you have it

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/home");
    }
  }, [navigate]);

  const [values, setValues] = useState({
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

    const { email, password } = values;
    if (!email || !password) {
      toast.error("Please fill all fields", toastOptions);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(loginAPI, { email, password });

      if (data.success === true) {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success(data.message || "Login successful", toastOptions);
        setTimeout(() => {
          window.location.href = "/home"; // reload so ProtectedRoute sees user
        }, 700);
      } else {
        toast.error(data.message || "Invalid credentials", toastOptions);
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
              <h2 className="login-title">Welcome back</h2>
              <p className="login-subtitle">Sign in to track your expenses and budgets.</p>

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail" className="mt-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    name="email"
                    onChange={handleChange}
                    value={values.email}
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    value={values.password}
                  />
                </Form.Group>

                <div className="login-extra">
                  <Link to="/forgotPassword" className="login-link">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="login-btn mt-2"
                  onClick={!loading ? handleSubmit : null}
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Login"}
                </Button>

                <p className="login-footer-text">
                  Don't have an account?{" "}
                  <Link to="/register" className="login-link">
                    Register
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

export default Login;
