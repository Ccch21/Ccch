import React, { useState, useEffect, useCallback } from 'react';
import BirthdayIntro from './pages/BirthdayIntro';
import End from './pages/End';
import CityDetail from './pages/CityDetail';

import Navbar from './components/Navbar';
import PinkAnimationHome from './components/PinkAnimationHome';
import FirstsTimeline from './components/firsts/FirstsTimeline';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [page, setPage] = useState('intro'); // intro(生日入口) / home / city / end
  const [selectedCity, setSelectedCity] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('towhere'); // towhere / breaking

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync tab state with URL hash for reload persistence
  useEffect(() => {
    // 1. Handle Pathname for direct city links (e.g. /city/杭州)
    const path = decodeURIComponent(window.location.pathname);
    if (path.startsWith('/city/')) {
      const cityName = path.replace('/city/', '');
      if (cityName) {
        setSelectedCity(cityName);
        setPage('city');
      }
    }

    // 2. Handle Hash for tabs
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['towhere', 'breaking'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    // Initial load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setTabWithHash = useCallback((tab) => {
    window.location.hash = tab;
    setActiveTab(tab);
  }, []);

  const handleSetTab = useCallback((tab) => {
    setTabWithHash(tab);
  }, [setTabWithHash]);

  const goTo = useCallback((p) => setPage(p), []);

  const goToCity = useCallback((cityName) => {
    setSelectedCity(cityName);
    setPage('city');
  }, []);

  const goBackToGlobe = useCallback(() => {
    setSelectedCity(null);
    setPage('home');
    handleSetTab('towhere');
  }, [handleSetTab]);

  return (
    <div style={{ width: '100%', height: '100%', margin: 0, padding: 0 }}>
      {/* 生日祝福入口页 */}
      {page === 'intro' && <BirthdayIntro goTo={goTo} />}

      {/* Render home view if page is home OR city, to keep globe mounted */}
      {(page === 'home' || page === 'city') && (
        <div style={{ display: page === 'city' ? 'none' : 'block', width: '100%', height: '100%' }}>
          {!isMobile && (
            <Navbar
              activeTab={activeTab}
              setTab={handleSetTab}
              isMobile={isMobile}
            />
          )}

          {isMobile && page === 'home' && (
            <div
              className="mobile-tab-toggle"
              onClick={() => handleSetTab(activeTab === 'towhere' ? 'breaking' : 'towhere')}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                zIndex: 100000,
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12l5 5 5-5M22 12l-5-5-5 5" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </div>
          )}

          <div className="page-content">
            {activeTab === 'towhere' && <PinkAnimationHome goTo={goTo} goToCity={goToCity} isCityMode={page === 'city'} isMobile={isMobile} />}
            {activeTab === 'breaking' && <FirstsTimeline />}
          </div>
        </div>
      )}

      {page === 'end' && <End goTo={goTo} />}

      {/* CityDetail renders on top, Globe continues to exist hidden */}
      {page === 'city' && selectedCity && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100%', zIndex: 9999, background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1525 40%, #111d35 100%)' }}>
          <CityDetail cityName={selectedCity} goBack={goBackToGlobe} />
        </div>
      )}

      <MusicPlayer />
    </div>
  );
}