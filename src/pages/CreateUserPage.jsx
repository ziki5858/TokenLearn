import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import Divider from "../components/Divider";
import LinkButton from "../components/LinkButton";
import googleIcon from "../assets/googleLogo.png";

export default function CreateUserPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretQuestion, setSecretQuestion] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const navigate = useNavigate();
  const { addNotification } = useApp();

  function handleSubmit(e) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      addNotification("Passwords do not match", "error");
      return;
    }

    if (!email || !password || !secretQuestion || !secretAnswer) {
      addNotification("Please fill out all fields", "error");
      return;
    }

    // No backend yet - mocking signup
    // Check if user is among first 50 (mock logic - in real app, check from backend)
    const currentUserCount = localStorage.getItem('userCount') || 0;
    const newUserCount = parseInt(currentUserCount) + 1;
    
    if (newUserCount <= 50) {
      localStorage.setItem('userCount', newUserCount.toString());
      addNotification(`User created successfully! You're user #${newUserCount} and received 50 free tokens! 🎉 Redirecting to your personal area to finish setup.`, "success");
    } else {
      addNotification("User created successfully! Redirecting to your personal area to finish setup.", "success");
    }
    
    setTimeout(() => navigate("/me"), 2500);
  }

  function handleGoogleSignup() {
    addNotification("Google signup (mock). We will hook up real OAuth later.", "info");
  }

  function handleBackToLogin() {
    navigate("/login");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "#e6f7ff"
      }}
    >
      <Card>
        <form onSubmit={handleSubmit}>
          <h1 style={{ textAlign: "center", marginBottom: 24 }}>TokenLearn</h1>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Create Account</h2>
          <p style={{ marginTop: 0, marginBottom: 16, color: "#666" }}>
            Sign up to get started
          </p>

          <div style={{ display: "grid", gap: 12 }}>
            <Button type="button" onClick={handleGoogleSignup}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
              >
                Continue with Google
                <img
                  src={googleIcon}
                  alt="Google"
                  style={{ width: 18, height: 18, objectFit: "contain" }}
                />
              </span>
            </Button>

            <Divider label="or" />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="name@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
            />
            <Input
              label="Secret Question"
              type="text"
              value={secretQuestion}
              onChange={setSecretQuestion}
              placeholder="e.g., What is your pet's name?"
            />
            <Input
              label="Answer"
              type="text"
              value={secretAnswer}
              onChange={setSecretAnswer}
              placeholder="Your answer"
            />

            <Button type="submit">Create Account</Button>

            <div style={{ textAlign: "center", marginTop: 6, fontSize: 14 }}>
              Already have an account?{" "}
              <LinkButton onClick={handleBackToLogin}>Sign in</LinkButton>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
