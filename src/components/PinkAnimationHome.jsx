import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CesiumGlobe from './CesiumGlobe';
import { supabase } from '../lib/supabaseClient';
import AdminTokenManager from './admin/AdminTokenManager';


// Carousel sequence: 0(15s) -> 1(15s) -> 2(40s) -> 1(15s) -> 0(15s) -> repeat
const CAROUSEL_SEQUENCE = [
    { stage: 0, duration: 15000 },
    { stage: 1, duration: 15000 },
    { stage: 2, duration: 40000 },
    { stage: 1, duration: 15000 },
    { stage: 0, duration: 15000 },
];

const INACTIVITY_TIMEOUT = 15000; // 15s

export default function PinkAnimationHome({ goTo, goToCity, isCityMode = false, isMobile = false }) {
    const [activeStage, setActiveStage] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true); // Whether CesiumGlobe should animate
    const [carouselActive, setCarouselActive] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [cities, setCities] = useState([]);
    const [cityPoints, setCityPoints] = useState([]);
    const carouselTimerRef = useRef(null);
    const carouselIndexRef = useRef(0);
    const inactivityTimerRef = useRef(null);
    const carouselKilledByClick = useRef(false); // True if user clicked a dot (permanent stop until page reload)

    // 生日寄语（管理员可在 InfoModal 中查看；Hakuna Matata 使用花体）
    const BIRTHDAY_MESSAGE = 'Hakuna Matata';
    const BIRTHDAY_WISH = '愿无忧无虑，万事胜意。\n感谢那些一起走过的时光，\n生日快乐，我的老朋友。';

    // ========= Admin Easter Egg =========
    const [showAdmin, setShowAdmin] = useState(false);
    const easterEggClickCount = useRef(0);
    const easterEggTimer = useRef(null);

    const handleTitleClick = useCallback(() => {
        easterEggClickCount.current += 1;
        console.log(`Title clicked ${easterEggClickCount.current}/3`);
        if (easterEggTimer.current) clearTimeout(easterEggTimer.current);
        if (easterEggClickCount.current >= 3) {
            console.log('Admin triggered!');
            easterEggClickCount.current = 0;
            setShowAdmin(true);
        } else {
            easterEggTimer.current = setTimeout(() => {
                console.log('Admin click count reset');
                easterEggClickCount.current = 0;
            }, 3000); // 3s
        }
    }, []);

    const refreshCities = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('cities')
                .select('name, lng, lat, color')
                .order('sort_order', { ascending: true });
            if (data && !error) {
                setCities(data.map(c => c.name));
                setCityPoints(data.filter(c => c.lng && c.lat).map(c => ({
                    name: c.name, lng: c.lng, lat: c.lat, color: c.color || '#FFFF00'
                })));
            }
        } catch (e) {
            console.error('Failed to refresh cities:', e);
        }
    }, []);

    // ========= Load Cities from Supabase =========
    useEffect(() => {
        const loadCities = async () => {
            console.log('[PinkAnimationHome] Fetching cities from Supabase...');
            try {
                const { data, error } = await supabase
                    .from('cities')
                    .select('name, lng, lat, color')
                    .order('sort_order', { ascending: true });
                if (data && !error) {
                    console.log(`[PinkAnimationHome] Successfully loaded ${data.length} cities`);
                    setCities(data.map(c => c.name));
                    setCityPoints(data.filter(c => c.lng && c.lat).map(c => ({
                        name: c.name,
                        lng: c.lng,
                        lat: c.lat,
                        color: c.color || '#FFFF00'
                    })));
                } else if (error) {
                    console.error('[PinkAnimationHome] Error loading cities:', error);
                }
            } catch (e) {
                console.error('[PinkAnimationHome] Unexpected error loading cities:', e);
            }
        };
        loadCities();
    }, []);

    // ========= Carousel Logic =========
    const advanceCarousel = useCallback(() => {
        if (isCityMode || carouselKilledByClick.current) return;

        const idx = carouselIndexRef.current;
        const step = CAROUSEL_SEQUENCE[idx];
        setActiveStage(step.stage);
        setIsAnimating(true);

        // Schedule next step
        carouselTimerRef.current = setTimeout(() => {
            carouselIndexRef.current = (idx + 1) % CAROUSEL_SEQUENCE.length;
            advanceCarousel();
        }, step.duration);
    }, [isCityMode]);

    const stopCarousel = useCallback(() => {
        if (carouselTimerRef.current) {
            clearTimeout(carouselTimerRef.current);
            carouselTimerRef.current = null;
        }
        setCarouselActive(false);
    }, []);

    const startCarousel = useCallback(() => {
        if (carouselKilledByClick.current) return;
        stopCarousel();
        setCarouselActive(true);
        carouselIndexRef.current = 0;
        advanceCarousel();
    }, [advanceCarousel, stopCarousel]);

    // Start carousel on mount
    useEffect(() => {
        startCarousel();
        return () => stopCarousel();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Pause/resume carousel when entering/leaving city mode
    useEffect(() => {
        if (isCityMode) {
            // Pause carousel and inactivity timer while in city
            stopCarousel();
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
                inactivityTimerRef.current = null;
            }
        } else {
            // When exiting city mode, ensure animation resumes
            setIsAnimating(true);
        }
    }, [isCityMode, stopCarousel]);

    // ========= Inactivity Timer =========
    const startInactivityTimer = useCallback(() => {
        if (carouselKilledByClick.current || isCityMode) return;
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            // Resume carousel after 30s of inactivity
            carouselKilledByClick.current = false;
            startCarousel();
        }, INACTIVITY_TIMEOUT);
    }, [isCityMode, startCarousel]);

    // ========= User Interaction Handler =========
    const handleUserInteract = useCallback(() => {
        if (isCityMode) return;
        // Stop animation and carousel
        setIsAnimating(false);
        stopCarousel();
        // Start inactivity timer
        startInactivityTimer();
    }, [isCityMode, stopCarousel, startInactivityTimer]);

    // ========= Dot Click Handler =========
    const handleStageClick = useCallback((index) => {
        // Kill carousel permanently until page reload or 30s inactivity
        carouselKilledByClick.current = true;
        stopCarousel();
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        setActiveStage(index);
        setIsAnimating(true);
        // Start inactivity timer - after 30s of no interaction, reset carousel
        startInactivityTimer();
    }, [stopCarousel, startInactivityTimer]);

    const sidebarWidth = 250;

    return (
        <div
            style={{
                width: '100vw', height: '100%', overflow: 'hidden',
                position: 'relative', background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1525 40%, #111d35 100%)', color: 'white'
            }}
        >
            {/* 站名标题（管理员彩蛋入口：连续点击 3 次） */}
            <div
                onClick={handleTitleClick}
                style={{
                    position: 'absolute',
                    top: '18px',
                    left: '24px',
                    zIndex: 100001,
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '1rem',
                    letterSpacing: '8px',
                    fontWeight: 300,
                    cursor: 'default',
                    userSelect: 'none',
                    textShadow: '0 0 12px rgba(255,255,255,0.15)'
                }}
            >
                故事仍在继续
            </div>

            {/* Globe */}
            <CesiumGlobe
                goToCity={goToCity}
                activeStage={activeStage}
                stageAnimating={isAnimating}
                onUserInteract={handleUserInteract}
                cityPoints={cityPoints}
            />

            {/* Bottom Navigation: 3 Glowing Dots */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.0 }} // Reduced duration and removed delay for better response
                style={{
                    position: 'absolute',
                    bottom: isMobile ? '80px' : '32px', // Stay above the music ball/safe area on mobile
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '18px',
                    alignItems: 'center',
                    zIndex: 100000, // Higher z-index to stay above other elements
                }}
            >
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        onClick={() => handleStageClick(i)}
                        style={{
                            width: '34px', height: '34px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <div style={{
                            width: activeStage === i ? '10px' : '6px',
                            height: activeStage === i ? '10px' : '6px',
                            borderRadius: '50%',
                            background: activeStage === i ? '#fff' : 'rgba(255,255,255,0.35)',
                            boxShadow: activeStage === i
                                ? '0 0 8px 3px rgba(255,255,255,0.5), 0 0 20px 6px rgba(255,255,255,0.2)'
                                : 'none',
                            transition: 'all 0.4s ease',
                        }} />
                    </div>
                ))}
            </motion.div>

            {/* Bottom Right Control Bar - Hidden on Mobile */}
            {window.innerWidth >= 768 && (
                <div style={{
                    position: 'absolute', bottom: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.2)', borderRadius: '20px',
                    padding: '8px 12px', backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)', zIndex: 20,
                    ...(showSidebar ? {
                        left: `calc(100% - ${sidebarWidth / 2}px)`, right: 'auto',
                        transform: 'translateX(-50%)', width: `${sidebarWidth - 40}px`,
                    } : {
                        right: '20px', left: 'auto', transform: 'none', width: 'auto',
                    }),
                }}>
                    <button onClick={() => setShowSidebar(!showSidebar)}
                        style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', marginRight: '8px' }}>
                        {showSidebar ? '›' : '‹'}
                    </button>
                    <button
                        onClick={() => setShowAdmin(true)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontWeight: 'bold',
                            marginRight: '8px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            fontSize: '0.9rem',
                            transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 0.7}
                        onMouseLeave={e => e.currentTarget.style.opacity = 1}
                    >
                        地点管理
                    </button>
                    <button onClick={() => setShowInfoModal(true)}
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white', fontSize: '16px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                        }}>?</button>
                </div>
            )}


            {/* City Sidebar */}
            <div style={{
                position: 'absolute', top: 0, right: 0, height: '100vh',
                width: `${sidebarWidth}px`, background: 'rgba(0, 0, 0, 0.85)',
                transform: showSidebar ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s ease',
                display: 'flex', flexDirection: 'column',
                padding: '20px', boxSizing: 'border-box', zIndex: 10,
                backdropFilter: 'blur(10px)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
                <h2 style={{
                    color: 'white',
                    margin: '0 0 20px 0',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    flexShrink: 0
                }}>选择地点</h2>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingRight: '5px',
                    paddingBottom: '80px', // 底部留白防止遮挡
                    scrollbarWidth: 'thin',
                }}>
                    {cities.length > 0 ? cities.map((city) => (
                        <motion.button key={city}
                            onClick={() => { goToCity(city); setShowSidebar(false); }}
                            style={{
                                display: 'block', width: '100%', padding: '12px 16px',
                                margin: '0 0 12px 0', background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s ease'
                            }}
                            whileHover={{ background: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.4)' }}
                            whileTap={{ scale: 0.98 }}>
                            {city}
                        </motion.button>
                    )) : (
                        <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '40px' }}>暂无地点</div>
                    )}
                </div>
            </div>

            {/* Info Modal: 生日寄语 */}
            <AnimatePresence>
                {showInfoModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowInfoModal(false)}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.88)',
                            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '40px', cursor: 'pointer'
                        }}>
                        <div onClick={(e) => e.stopPropagation()}
                            style={{
                                display: 'flex',
                                gap: '24px',
                                maxWidth: '1100px',
                                width: '100%',
                                maxHeight: '70vh',
                                cursor: 'default',
                                alignItems: 'stretch'
                            }}>
                            <div style={{
                                flex: 1,
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                                background: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <video src={`${import.meta.env.BASE_URL}video/all.mp4`} autoPlay loop muted controls playsInline
                                    style={{ width: '100%', height: '100%', display: 'block', outline: 'none', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10px' }}>
                                <div className="font-script" style={{
                                    fontSize: 'clamp(3rem, 6vw, 5rem)',
                                    color: '#F6BEC8',
                                    lineHeight: 1.15,
                                    textShadow: '0 0 30px rgba(246,190,200,0.4)',
                                    marginBottom: '24px'
                                }}>
                                    {BIRTHDAY_MESSAGE}
                                </div>
                                <div style={{
                                    fontSize: '1.05rem',
                                    lineHeight: '2.2',
                                    color: 'rgba(255,255,255,0.9)',
                                    whiteSpace: 'pre-line'
                                }}>
                                    {BIRTHDAY_WISH}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Admin Panel (Easter Egg) */}
            <AdminTokenManager
                isOpen={showAdmin}
                onClose={() => setShowAdmin(false)}
                onCityCreated={refreshCities}
            />
        </div>
    );
}