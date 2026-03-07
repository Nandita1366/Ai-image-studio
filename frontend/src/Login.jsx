import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/\(.*\)/, ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/\(.*\)/, ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; font-family: 'DM Sans', sans-serif; color: #fff; }

        .login-bg {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 20px;
          background: #080808;
          background-image: radial-gradient(ellipse 80% 50% at 50% -10%, #7c3aed22, transparent),
                            radial-gradient(ellipse 60% 40% at 80% 100%, #db277715, transparent);
        }

        .login-card {
          width: 100%; max-width: 420px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px; padding: 40px 36px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(124,58,237,0.08);
        }

        .login-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 1.8rem; color: #fff;
          letter-spacing: -0.02em; margin-bottom: 6px; text-align: center;
        }
        .login-subtitle { color: #555; font-size: 0.88rem; text-align: center; margin-bottom: 32px; }

        .google-btn {
          width: 100%; padding: 12px;
          border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #fff; font-size: 0.9rem; font-family: 'DM Sans', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.2s; margin-bottom: 20px;
        }
        .google-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }

        .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider-text { color: #444; font-size: 0.78rem; }

        .input-group { margin-bottom: 14px; }
        .input-label { font-size: 0.75rem; color: #555; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; display: block; }
        .input-field {
          width: 100%; padding: 12px 14px;
          border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: #fff;
          font-size: 0.9rem; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .input-field::placeholder { color: #333; }
        .input-field:focus { border-color: rgba(167,139,250,0.4); }

        .submit-btn {
          width: 100%; padding: 13px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #7c3aed, #9333ea, #c026d3);
          color: white; font-weight: 600; font-size: 0.95rem;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; margin-top: 6px;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(124,58,237,0.5); }
        .submit-btn:disabled { background: #222; color: #444; cursor: not-allowed; box-shadow: none; }

        .error-msg { color: #f87171; font-size: 0.82rem; margin-top: 12px; text-align: center; }

        .toggle-text { text-align: center; margin-top: 20px; color: #555; font-size: 0.85rem; }
        .toggle-link { color: #a78bfa; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; }
        .toggle-link:hover { color: #c084fc; }
      `}</style>

      <div className="login-bg">
        <div className="login-card">
          <h1 className="login-title">✨ AI Image Studio</h1>
          <p className="login-subtitle">{isSignUp ? "Create your account" : "Welcome back"}</p>

          {/* Google Button */}
          <button className="google-btn" onClick={handleGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or</span>
            <div className="divider-line" />
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
           <div style={{position:"relative"}}>
  <input className="input-field" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
    onKeyDown={e => e.key === "Enter" && handleEmailAuth()} style={{paddingRight:"44px", width:"100%"}} />
  <button onClick={() => setShowPassword(p => !p)} type="button"
    style={{position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:"1rem"}}>
    {showPassword ? "🙈" : "👁️"}
  </button>
</div>          </div>

          <button className="submit-btn" onClick={handleEmailAuth} disabled={loading || !email || !password}>
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>

          {error && <p className="error-msg">{error}</p>}

          <p className="toggle-text">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button className="toggle-link" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;