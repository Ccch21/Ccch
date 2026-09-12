import React from 'react';
import { motion } from 'framer-motion';

export default function BirthdayIntro({ goTo }) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: `url(${import.meta.env.BASE_URL}images/Background.jpg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    }}>
      {/* 暗色遮罩，保证文字可读 */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5, 10, 20, 0.55)', zIndex: 1 }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px' }}
      >
        <div style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', letterSpacing: '8px', color: 'rgba(255,255,255,0.75)', marginBottom: '24px', fontWeight: 300 }}>
          HAPPY BIRTHDAY
        </div>

        <div className="font-script" style={{
          fontSize: 'clamp(4rem, 14vw, 8rem)',
          color: '#F6BEC8',
          lineHeight: 1.1,
          textShadow: '0 0 40px rgba(246,190,200,0.45)',
          marginBottom: '30px'
        }}>
          Hakuna Matata
        </div>

        <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2.3rem)', fontWeight: 300, letterSpacing: '4px', color: 'rgba(255,255,255,0.92)', marginBottom: '12px' }}>
          To CC
        </div>
        <div style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 300, letterSpacing: '2px', color: 'rgba(255,255,255,0.65)', marginBottom: '52px' }}>
          愿无忧无虑，万事胜意
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(246, 190, 200, 0.35)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => goTo('home')}
          style={{
            padding: '16px 44px',
            fontSize: '1.05rem',
            letterSpacing: '3px',
            background: 'rgba(246, 190, 200, 0.15)',
            border: '1px solid rgba(246, 190, 200, 0.55)',
            borderRadius: '50px',
            color: '#F6BEC8',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit'
          }}
        >
          进入回忆
        </motion.button>
      </motion.div>

    </div>
  );
}