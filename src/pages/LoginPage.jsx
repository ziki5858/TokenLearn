import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import Divider from "../components/Divider";
import LinkButton from "../components/LinkButton";
import googleIcon from "../assets/googleLogo.png";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    // No backend yet - mocking login
    navigate("/home");
  }

  function handleGoogleLogin() {
    alert("Google login (mock). We will hook up real OAuth later.");
  }

  function handleForgotPassword() {
    navigate("/forgot-password");
  }

  function handleRegister() {
    navigate("/register");
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
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Login</h2>
          <p style={{ marginTop: 0, marginBottom: 16, color: "#666" }}>
            Sign in to continue
          </p>

          <div style={{ display: "grid", gap: 12 }}>
       <Button type="button" onClick={handleGoogleLogin}>
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

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <LinkButton onClick={handleForgotPassword} fontSize={13}>
                Forgot password?
              </LinkButton>
            </div>

            <Button type="submit">Sign in</Button>

            <div style={{ textAlign: "center", marginTop: 6, fontSize: 14 }}>
              Don&apos;t have an account?{" "}
              <LinkButton onClick={handleRegister}>Create one</LinkButton>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
