import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    // כרגע בלי שרת - מדמים התחברות
    navigate("/home");
  }

  function handleGoogleLogin() {
    alert("התחברות עם Google (מדומה). בהמשך נחבר OAuth אמיתי.");
  }

  function handleForgotPassword() {
    alert("בקרוב: ניצור חלון 'שכחתי סיסמה' ונחבר אותו ל-Router.");
  }

  function handleRegister() {
    alert("בקרוב: ניצור חלון 'יצירת משתמש חדש' ונחבר אותו ל-Router.");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 380,
          border: "1px solid #eee",
          borderRadius: 16,
          padding: 20,
          background: "white"
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 6 }}>Login</h1>
        <p style={{ marginTop: 0, marginBottom: 16, color: "#666" }}>
          Sign in to continue
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          {/* Google login */}
          <Button type="button" onClick={handleGoogleLogin}>
            Continue with Google
          </Button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ height: 1, background: "#eee", flex: 1 }} />
            <span style={{ fontSize: 12, color: "#888" }}>or</span>
            <div style={{ height: 1, background: "#eee", flex: 1 }} />
          </div>

          {/* Email & Password */}
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

          {/* Forgot password */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleForgotPassword}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "#1a73e8",
                cursor: "pointer",
                fontSize: 13
              }}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <Button type="submit">Sign in</Button>

          {/* Register */}
          <div style={{ textAlign: "center", marginTop: 6, fontSize: 14 }}>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={handleRegister}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "#1a73e8",
                cursor: "pointer",
                fontSize: 14
              }}
            >
              Create one
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
