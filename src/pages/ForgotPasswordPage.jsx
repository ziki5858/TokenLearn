import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import LinkButton from "../components/LinkButton";
import { useApp } from "../context/useApp";

// Mock users - will be fetched from the server later
const MOCK_USERS = {
  "user@example.com": {
    secretQuestion: "What is your pet's name?",
    secretAnswer: "fluffy"
  },
  "test@test.com": {
    secretQuestion: "What city were you born in?",
    secretAnswer: "jerusalem"
  }
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // Step 1: enter email, Step 2: answer question, Step 3: set new password, Step 4: success
  const [email, setEmail] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { addNotification } = useApp();

  // Step 1: Get secret question by email
  // API: POST /api/auth/secret-question
  function handleEmailSubmit(e) {
    e.preventDefault();
    setError("");

    const user = MOCK_USERS[email.toLowerCase()];
    
    if (!user) {
      setError("User not found");
      return;
    }

    setCurrentUser(user);
    setStep(2);
  }

  // Step 2: Verify secret answer
  // API: POST /api/auth/verify-secret-answer
  function handleAnswerSubmit(e) {
    e.preventDefault();
    setError("");

    if (answer.toLowerCase().trim() === currentUser.secretAnswer.toLowerCase()) {
      // In real app, API returns resetToken
      setResetToken("mock_reset_token_" + Date.now());
      setStep(3);
    } else {
      setError("Incorrect answer. Try again.");
      setAnswer("");
    }
  }

  // Step 3: Reset password with token
  // API: POST /api/auth/reset-password
  function handleResetPassword(e) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // In real app: POST /api/auth/reset-password with { email, resetToken, newPassword }
    console.log("Resetting password with token:", resetToken);
    addNotification("Password reset successfully!", "success");
    setStep(4);
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
        <h1 style={{ textAlign: "center", marginBottom: 24 }}>TokenLearn</h1>
        <h2 style={{ marginTop: 0, marginBottom: 6 }}>Forgot Password</h2>
        <p style={{ marginTop: 0, marginBottom: 16, color: "#666" }}>
          {step === 1 && "Enter your email to recover your password"}
          {step === 2 && "Answer your secret question"}
          {step === 3 && "Create a new password"}
          {step === 4 && "Password reset complete"}
        </p>

        {error && (
          <div
            style={{
              padding: 12,
              marginBottom: 16,
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              color: "#991b1b"
            }}
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div style={{ display: "grid", gap: 12 }}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="name@example.com"
              />
              <Button type="submit">Continue</Button>
              <div style={{ textAlign: "center", marginTop: 6, fontSize: 14 }}>
                Remember your password?{" "}
                <LinkButton onClick={handleBackToLogin}>Sign in</LinkButton>
              </div>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleAnswerSubmit}>
            <div style={{ display: "grid", gap: 12 }}>
              <div
                style={{
                  padding: 12,
                  backgroundColor: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  borderRadius: 8,
                  marginBottom: 8
                }}
              >
                <strong>Secret Question:</strong>
                <div style={{ marginTop: 6 }}>{currentUser.secretQuestion}</div>
              </div>

              <Input
                label="Your Answer"
                type="text"
                value={answer}
                onChange={setAnswer}
                placeholder="Enter your answer"
              />
              <Button type="submit">Verify Answer</Button>
              <div style={{ textAlign: "center", marginTop: 6, fontSize: 14 }}>
                <LinkButton onClick={handleBackToLogin}>Back to login</LinkButton>
              </div>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div style={{ display: "grid", gap: 12 }}>
              <div
                style={{
                  padding: 12,
                  backgroundColor: "#d1fae5",
                  border: "1px solid #6ee7b7",
                  borderRadius: 8,
                  marginBottom: 8,
                  color: "#065f46"
                }}
              >
                ✓ Identity verified! Now create a new password.
              </div>

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="••••••••"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="••••••••"
              />
              <Button type="submit">Reset Password</Button>
              <div style={{ textAlign: "center", marginTop: 6, fontSize: 14 }}>
                <LinkButton onClick={handleBackToLogin}>Back to login</LinkButton>
              </div>
            </div>
          </form>
        )}

        {step === 4 && (
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                padding: 16,
                backgroundColor: "#d1fae5",
                border: "1px solid #6ee7b7",
                borderRadius: 8,
                textAlign: "center"
              }}
            >
              <div style={{ marginBottom: 8, color: "#065f46", fontWeight: "bold", fontSize: 18 }}>
                ✓ Password Reset Successful!
              </div>
              <div style={{ color: "#065f46" }}>
                Your password has been changed. You can now sign in with your new password.
              </div>
            </div>

            <Button onClick={handleBackToLogin}>Back to Login</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
