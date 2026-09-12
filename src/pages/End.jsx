import React from 'react';

export default function End({ goTo }) {
  return (
    <div style={{ textAlign: 'center', minHeight: '100vh', background: 'linear-gradient(180deg, #0d1525 0%, #1a2740 100%)', color: '#e8edf5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', boxSizing: 'border-box' }}>
      <div className="font-script" style={{ fontSize: 'clamp(3rem, 10vw, 5.5rem)', color: '#F6BEC8', marginBottom: '30px', textShadow: '0 0 40px rgba(246,190,200,0.4)' }}>Hakuna Matata</div>
      <h2 style={{ margin: 0, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 600, letterSpacing: '2px' }}>故事还在继续……</h2>
      <p style={{ fontSize: 'clamp(1rem, 3vw, 1.15rem)', margin: '30px 0 40px', lineHeight: 1.9, color: 'rgba(232,237,245,0.85)', maxWidth: '560px' }}>
        感谢你陪我走过的每一段旅程，<br />
        未来还有更多美好，等着我们一起去发现。
      </p>
      <button onClick={() => goTo('home')} style={{ marginTop: 10, fontSize: 16, padding: '12px 34px', borderRadius: 50, background: 'rgba(246, 190, 200, 0.15)', color: '#F6BEC8', border: '1px solid rgba(246,190,200,0.5)', cursor: 'pointer', letterSpacing: '2px', transition: 'all 0.3s ease' }}>
        回到首页
      </button>
    </div>
  );
}