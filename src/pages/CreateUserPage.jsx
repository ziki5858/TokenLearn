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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
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

    if (!firstName || !lastName || !email || !password || !secretQuestion || !secretAnswer) {
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input
                label="First Name"
                type="text"
                value={firstName}
                onChange={setFirstName}
                placeholder="John"
              />
              <Input
                label="Last Name"
                type="text"
                value={lastName}
                onChange={setLastName}
                placeholder="Doe"
              />
            </div>
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

            {/* Role Selection */}
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>I want to join as:</label>
              <div style={{ display: "flex", gap: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span style={{ fontWeight: role === "student" ? 700 : 400 }}>📚 Student</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={role === "teacher"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span style={{ fontWeight: role === "teacher" ? 700 : 400 }}>🎓 Teacher</span>
                </label>
              </div>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                You can always change this later in your profile settings.
              </p>
            </div>

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
