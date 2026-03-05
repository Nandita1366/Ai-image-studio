import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "./Login";

const STYLES = [
  { label: "Photorealistic", emoji: "📸", value: "photorealistic, 8k, ultra detailed, cinematic lighting" },
  { label: "Anime", emoji: "🌸", value: "anime style, vibrant colors, studio ghibli, detailed" },
  { label: "Oil Painting", emoji: "🖼️", value: "oil painting, classic art, rich brush strokes, renaissance" },
  { label: "Cyberpunk", emoji: "⚡", value: "cyberpunk, neon lights, futuristic dystopian city, rain" },
  { label: "Watercolor", emoji: "🎨", value: "watercolor painting, soft dreamy colors, artistic, flowing" },
  { label: "Sketch", emoji: "✏️", value: "detailed pencil sketch, black and white, fine line art" },
];

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 const [history, setHistory] = useState(() => {
  try {
    const saved = localStorage.getItem("imageHistory");
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
});  
const [dots, setDots] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? "" : d + ".");
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  if (authLoading) return <div style={{minHeight:"100vh",background:"#080808"}} />;
  if (!user) return <Login />;

  const generateImage = async () => {
    if (!prompt || loading) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);
    setActiveItem(null);
    const fullPrompt = prompt + ", " + selectedStyle.value;
    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      const data = await response.json();
      if (data.image_url) {
        const url = data.image_url + "?t=" + Date.now();
        setImageUrl(url);
        const newItem = { id: Date.now(), prompt, style: selectedStyle.label, emoji: selectedStyle.emoji, url };
        setHistory(prev => {
  const updated = [newItem, ...prev];
  localStorage.setItem("imageHistory", JSON.stringify(updated));
  return updated;
});        
setActiveItem(newItem.id);
      } else {
        setError("Generation failed. Please try again.");
      }
    } catch {
      setError("Cannot connect to backend. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item) => {
    setImageUrl(item.url);
    setPrompt(item.prompt);
    setActiveItem(item.id);
    setError(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; min-height: 100vh; font-family: 'DM Sans', sans-serif; color: #fff; overflow-x: hidden; }
        .bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 80% 50% at 50% -10%, #7c3aed22, transparent), radial-gradient(ellipse 60% 40% at 80% 100%, #db277715, transparent); }
        .layout { position: relative; z-index: 1; display: flex; min-height: 100vh; }
        .sidebar { width: 260px; flex-shrink: 0; background: #0d0d0d; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; transition: width 0.3s ease; overflow: hidden; }
        .sidebar.closed { width: 0; }
        .sidebar-header { padding: 20px 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; }
        .sidebar-title { font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: #444; white-space: nowrap; }
        .clear-btn { font-size: 0.7rem; color: #333; background: none; border: none; cursor: pointer; white-space: nowrap; font-family: 'DM Sans', sans-serif; transition: color 0.2s; }
        .clear-btn:hover { color: #f87171; }
        .sidebar-list { flex: 1; overflow-y: auto; padding: 8px; }
        .sidebar-list::-webkit-scrollbar { width: 3px; }
        .sidebar-list::-webkit-scrollbar-thumb { background: #222; border-radius: 99px; }
        .sidebar-empty { padding: 24px 16px; text-align: center; color: #333; font-size: 0.82rem; line-height: 1.6; }
        .history-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; cursor: pointer; margin-bottom: 4px; transition: all 0.15s; border: 1px solid transparent; }
        .history-item:hover { background: rgba(255,255,255,0.04); }
        .history-item.active { background: rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.2); }
        .history-thumb-img { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.08); }
        .history-item-info { flex: 1; min-width: 0; }
        .history-item-prompt { font-size: 0.8rem; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .history-item-style { font-size: 0.7rem; color: #444; margin-top: 2px; }
        .sidebar-footer { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.05); }
        .new-btn { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #666; cursor: pointer; font-size: 0.82rem; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .new-btn:hover { color: #fff; border-color: rgba(255,255,255,0.15); }
        .main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px 60px; min-width: 0; }
        .top-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 10; display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(8,8,8,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .toggle-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #666; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
        .toggle-btn:hover { color: #fff; }
        .top-title { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: #fff; }
        .user-info { margin-left: auto; display: flex; align-items: center; gap: 10px; }
        .user-email { font-size: 0.8rem; color: #555; }
       .signout-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); color: #aaa; cursor: pointer; font-size: 0.8rem; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }        .signout-btn:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
        .content { margin-top: 60px; width: 100%; max-width: 620px; }
        .header { text-align: center; margin-bottom: 36px; }
        .title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: clamp(2rem, 5vw, 3rem); color: #ffffff; letter-spacing: -0.02em; margin-bottom: 10px; }
        .subtitle { color: #555; font-size: 0.95rem; font-weight: 300; }
        .card { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px 28px 24px; backdrop-filter: blur(12px); box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(124,58,237,0.08); }
        .section-label { font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: #444; margin-bottom: 10px; }
        .styles-row { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 22px; }
        .style-pill { display: flex; align-items: center; gap: 5px; padding: 6px 13px; border-radius: 99px; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); color: #555; cursor: pointer; font-size: 0.82rem; transition: all 0.18s; font-family: 'DM Sans', sans-serif; }
        .style-pill:hover { color: #aaa; border-color: rgba(255,255,255,0.15); }
        .style-pill.active { border-color: rgba(167,139,250,0.5); background: rgba(124,58,237,0.12); color: #c084fc; }
        .divider { height: 1px; background: rgba(255,255,255,0.05); margin-bottom: 22px; }
        .input-row { display: flex; gap: 10px; align-items: stretch; }
        .prompt-input { flex: 1; min-width: 0; padding: 13px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #fff; font-size: 0.92rem; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
        .prompt-input::placeholder { color: #333; }
        .prompt-input:focus { border-color: rgba(167,139,250,0.4); }
        .gen-btn { padding: 13px 22px; border-radius: 12px; border: none; background: linear-gradient(135deg, #7c3aed, #9333ea, #c026d3); color: white; font-weight: 600; font-size: 0.9rem; cursor: pointer; white-space: nowrap; font-family: 'DM Sans', sans-serif; transition: all 0.2s; box-shadow: 0 4px 20px rgba(124,58,237,0.35); flex-shrink: 0; }
        .gen-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(124,58,237,0.5); }
        .gen-btn:disabled { background: rgba(255,255,255,0.06); color: #333; cursor: not-allowed; box-shadow: none; }
        .progress-wrap { margin-top: 14px; }
        .progress-bar-bg { height: 2px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden; }
        .progress-bar { height: 100%; width: 35%; background: linear-gradient(90deg, #7c3aed, #c026d3); border-radius: 99px; animation: progressSlide 1.8s ease-in-out infinite; }
        @keyframes progressSlide { 0% { margin-left: -35%; } 100% { margin-left: 100%; } }
        .progress-text { text-align: center; color: #444; font-size: 0.8rem; margin-top: 8px; }
        .error-msg { color: #f87171; font-size: 0.82rem; margin-top: 10px; }
        .result-wrap { margin-top: 20px; }
        .result-img { width: 100%; border-radius: 12px; display: block; box-shadow: 0 0 50px rgba(124,58,237,0.2); animation: fadeUp 0.4s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .result-actions { display: flex; gap: 8px; margin-top: 12px; }
        .action-btn { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); color: #666; cursor: pointer; font-size: 0.82rem; font-family: 'DM Sans', sans-serif; transition: all 0.2s; text-align: center; }
        .action-btn:hover { color: #fff; border-color: rgba(255,255,255,0.15); }
        @media (max-width: 600px) { .card { padding: 20px 16px; } .input-row { flex-direction: column; } .gen-btn { width: 100%; } }
      `}</style>

      <div className="bg" />

      <div className="top-bar">
        <button className="toggle-btn" onClick={() => setSidebarOpen(o => !o)}>☰</button>
        <span className="top-title">AI Image Studio</span>
        <div className="user-info">
          <span className="user-email">{user.email || user.displayName}</span>
          <button className="signout-btn" onClick={() => signOut(auth)}>Sign out</button>
        </div>
      </div>

      <div className="layout">
        <div className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">History</span>
            {history.length > 0 && <button className="clear-btn" onClick={() => { setHistory([]); localStorage.removeItem("imageHistory"); setImageUrl(null); setPrompt(""); }}>Clear all</button>}
          </div>
          <div className="sidebar-list">
            {history.length === 0 ? (
              <div className="sidebar-empty">No generations yet.<br />Create your first image!</div>
            ) : (
              history.map(item => (
                <div key={item.id} className={`history-item ${activeItem === item.id ? "active" : ""}`} onClick={() => loadFromHistory(item)}>
                  <img src={item.url} alt={item.prompt} className="history-thumb-img" />
                  <div className="history-item-info">
                    <div className="history-item-prompt">{item.prompt}</div>
                    <div className="history-item-style">{item.emoji} {item.style}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="sidebar-footer">
            <button className="new-btn" onClick={() => { setImageUrl(null); setPrompt(""); setActiveItem(null); }}>+ New Generation</button>
          </div>
        </div>

        <div className="main">
          <div className="content">
            <div className="header">
              <h1 className="title">AI Image Studio</h1>
              <p className="subtitle">Transform your words into stunning visuals</p>
            </div>
            <div className="card">
              <p className="section-label">Style</p>
              <div className="styles-row">
                {STYLES.map(s => (
                  <button key={s.label} className={`style-pill ${selectedStyle.label === s.label ? "active" : ""}`} onClick={() => setSelectedStyle(s)}>
                    <span>{s.emoji}</span>{s.label}
                  </button>
                ))}
              </div>
              <div className="divider" />
              <p className="section-label">Prompt</p>
              <div className="input-row">
                <input className="prompt-input" type="text" value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && generateImage()} placeholder="Describe your image..." />
                <button className="gen-btn" onClick={generateImage} disabled={loading || !prompt}>
                  {loading ? `Creating${dots}` : "Generate ✦"}
                </button>
              </div>
              {loading && (
                <div className="progress-wrap">
                  <div className="progress-bar-bg"><div className="progress-bar" /></div>
                  <p className="progress-text">Generating your {selectedStyle.label} image — ~30s</p>
                </div>
              )}
              {error && <p className="error-msg">⚠ {error}</p>}
              {imageUrl && !loading && (
                <div className="result-wrap">
                  <img src={imageUrl} alt="Generated" className="result-img" />
                  <div className="result-actions">
                    <button className="action-btn" onClick={async () => {
                      const res = await fetch(imageUrl);
                      const blob = await res.blob();
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = "ai-image.png";
                      a.click();
                    }}>⬇ Download</button>
                    <button className="action-btn" onClick={() => { setImageUrl(null); setPrompt(""); setActiveItem(null); }}>✦ New Image</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;