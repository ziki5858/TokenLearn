import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import LinkButton from "../components/LinkButton";

// Mock users - will be fetched from the server later
const MOCK_USERS = {
  "user@example.com": {
    secretQuestion: "What is your pet's name?",
    secretAnswer: "fluffy",
    password: "password123"
  },
  "test@test.com": {
    secretQuestion: "What city were you born in?",
    secretAnswer: "jerusalem",
    password: "test123"
  }
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // Step 1: enter email, Step 2: answer question
  const [email, setEmail] = useState("");
  const [answer, setAnswer] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [revealedPassword, setRevealedPassword] = useState("");
  const navigate = useNavigate();

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

  function handleAnswerSubmit(e) {
    e.preventDefault();
    setError("");

    if (answer.toLowerCase().trim() === currentUser.secretAnswer.toLowerCase()) {
      setRevealedPassword(currentUser.password);
      setStep(3);
    } else {
      setError("Incorrect answer. Try again.");
      setAnswer("");
    }
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
          {step === 3 && "Your password has been retrieved"}
        </p>

        {error && (
          <div
            style={{
              padding: 12,
              marginBottom: 16,
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: 6,
              color: "#c33"
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
                  backgroundColor: "#f0f0f0",
                  borderRadius: 6,
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
              <Button type="submit">Submit Answer</Button>
              <div style={{ textAlign: "center", marginTop: 6, fontSize: 14 }}>
                <LinkButton onClick={handleBackToLogin}>Back to login</LinkButton>
              </div>
            </div>
          </form>
        )}

        {step === 3 && (
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                padding: 16,
                backgroundColor: "#e8f5e9",
                border: "1px solid #c8e6c9",
                borderRadius: 6,
                textAlign: "center"
              }}
            >
              <div style={{ marginBottom: 8, color: "#2e7d32", fontWeight: "bold" }}>
                ✓ Success!
              </div>
              <div style={{ marginBottom: 4 }}>Your password is:</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  fontFamily: "monospace",
                  padding: 8,
                  backgroundColor: "#fff",
                  borderRadius: 4,
                  marginTop: 8
                }}
              >
                {revealedPassword}
              </div>
            </div>

            <Button onClick={handleBackToLogin}>Back to Login</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
