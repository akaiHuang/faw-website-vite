import { useState, useEffect, useRef, type FC, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';

// --- Split Text Animation Component - inkgames style 原版樣式 ---
interface SplitTextLineProps {
  text: string;
  delay?: number;
  trigger: boolean;
  isGradient?: boolean;
}

export const SplitTextLine: FC<SplitTextLineProps> = ({ text, delay = 0, trigger, isGradient = false }) => {
  const chars = text.split('');
  
  return (
    <span className={`split-text-line ${isGradient ? 'gradient-text' : ''}`}>
      <span className={`split-text-word ${isGradient ? 'gradient-text' : ''}`}>
        {chars.map((char, index) => (
          <span
            key={index}
            className={`split-text-char ${trigger ? 'visible' : ''}`}
            style={{
              transitionDelay: `${delay + index * 0.03}s`
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );
};

// --- Hello Rotator Component ---
interface RotatorItem {
  tag: string;
  question: string;
}

interface HelloRotatorProps {
  trigger: boolean;
}

export const HelloRotator: FC<HelloRotatorProps> = ({ trigger }) => {
  const items: RotatorItem[] = [
    // 🚀 Tech Stack Strategy
    { tag: "Architecture", question: "n8n or Make?" },
    { tag: "Trend", question: "Vibe Coding implementation?" },
    { tag: "Security", question: "On-prem LLM setup?" },
    { tag: "Cost", question: "Model distillation costs?" },
    { tag: "Risk", question: "Agent autonomy limits?" },
    // 🧠 Model Orchestration
    { tag: "Strategy", question: "Fine-tuning vs. RAG?" },
    { tag: "Multimodal", question: "Multimodal AI apps?" },
    { tag: "Guardrails", question: "Preventing AI hallucinations?" },
    { tag: "Integration", question: "Gemini 3 integration?" },
    { tag: "Reasoning", question: "o1/o3 reasoning apps?" },
    // 🎯 Next-Gen Marketing
    { tag: "SEO", question: "SEO? GEO? AEO?" },
    { tag: "Hyper-Personalization", question: "Hyper-personalized push?" },
    { tag: "Realtime", question: "Real-time video generation?" },
    { tag: "Virtual KOL", question: "Virtual influencer management?" },
    { tag: "Automation", question: "Fully automated funnels?" },
    // 💼 Business Transformation
    { tag: "Org Design", question: "AI replacing AEs?" },
    { tag: "Monetization", question: "Data asset monetization?" },
    { tag: "MarTech", question: "Marketing hub transformation?" },
    { tag: "Compliance", question: "LLM automation?" },
    { tag: "Future", question: "Human-AI collaboration?" },
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setIsAnimating(false);
      }, 200);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [trigger, items.length]);

  return (
    <div 
      className="flex items-center gap-2 sm:gap-3"
      style={{ 
        opacity: trigger ? 1 : 0,
        transform: trigger ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.2, 0.715, 0.205, 0.99) 1.9s',
        fontFamily: "'Space Grotesk', monospace"
      }}
    >
      {/* Question Group - Single Box with Bracket Tag */}
      <div 
        className="inline-flex items-center justify-center py-1.5 px-2 sm:py-2 sm:px-[14px] border border-cyan-500/50 overflow-hidden"
        style={{
          background: 'rgb(42, 42, 42)',
        }}
      >
        <span 
          className="text-[10px] sm:text-[13px] font-medium text-cyan-500 tracking-wide whitespace-nowrap"
          style={{
            transform: isAnimating ? 'translateY(100%)' : 'translateY(0)',
            opacity: isAnimating ? 0 : 1,
            transition: 'all 0.2s ease-out'
          }}
        >
          <span style={{ opacity: 0.7 }}>[{items[currentIndex].tag}]</span> {items[currentIndex].question}
        </span>
      </div>

      {/* Email Link */}
      <a 
        href="mailto:akai@fawstudio.com"
        className="text-[10px] sm:text-[13px] py-1.5 px-2 sm:py-2 sm:px-[14px] border border-white/50 text-white/50 no-underline transition-all hover:border-white-500/50 hover:text-cyan-500 "
        style={{
          background: 'rgb(255, 255, 255, 1)',
          color: 'rgb(0, 0, 0)',
        }}
      >
        akai@fawstudio.com
      </a>
    </div>
  );
};

// --- Loading Screen Component - 原版 Logo 遮罩動畫 ---
interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const isCompleteRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = Math.random() * 8 + 2;
        return Math.min(prev + increment, 100);
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !isCompleteRef.current) {
      isCompleteRef.current = true;
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          onComplete();
        }, 800);
      }, 500);
    }
  }, [progress, onComplete]);

  // Calculate clip-path: from bottom (100%) to top (0%)
  const clipValue = 100 - progress;

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-logo-container">
        {/* Semi-transparent background logo */}
        <img 
          src="/img/logopng.png" 
          alt="" 
          className="loading-logo-bg"
        />
        {/* Opaque logo with mask from bottom to top */}
        <img 
          src="/img/logopng.png" 
          alt="Loading..." 
          className="loading-logo-fill"
          style={{ clipPath: `inset(${clipValue}% 0 0 0)` }}
        />
      </div>
    </div>
  );
};

// --- Transition Overlay Component ---
interface TransitionOverlayProps {
  isPlaying: boolean;
  onNavStart?: () => void;
  onComplete?: () => void;
}

export const TransitionOverlay: FC<TransitionOverlayProps> = ({ isPlaying, onNavStart, onComplete }) => {
  useEffect(() => {
    if (!isPlaying) return;
    onNavStart?.();
    const timer = window.setTimeout(() => {
      onComplete?.();
    }, 800);
    return () => window.clearTimeout(timer);
  }, [isPlaying, onNavStart, onComplete]);

  return (
    <div className={`transition-overlay ${isPlaying ? 'playing' : ''}`}>
      <div className="color-block" />
    </div>
  );
};

// --- Nav Item Component ---
interface NavItemProps {
  children: ReactNode;
  href: string;
  delay: number;
  visible: boolean;
}

export const NavItem: FC<NavItemProps> = ({ children, href, delay, visible }) => {
  return (
    <a 
      href={href}
      className={`nav-item text-sm font-medium text-gray-300 hover:text-cyan-400 uppercase tracking-widest transition-colors ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: visible ? `${delay}s` : '0s' }}
    >
      {children}
    </a>
  );
};

// --- Portal Card Component - 原版 3D 傳送門卡片 ---
interface Project {
  id: number | string;
  title: string;
  category: string;
  image: string;
  client?: string;
  slogan?: string;
}

interface PortalCardProps {
  project: Project;
  index: number;
}

export const PortalCard: FC<PortalCardProps> = ({ project }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, imgX: 0, imgY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 計算滑鼠相對於卡片中心的位置 (-1 to 1)
    const relativeX = (e.clientX - centerX) / (rect.width / 2);
    const relativeY = (e.clientY - centerY) / (rect.height / 2);
    
    // 3D 傾斜角度 (最大 ±8度)
    const rotateY = relativeX * 8;
    const rotateX = -relativeY * 8;
    
    // 圖片視差位移 (傳送門深度效果)
    const imgX = relativeX * -20;
    const imgY = relativeY * -20;
    
    setTransform({ rotateX, rotateY, imgX, imgY });
  };

  // Touch handlers for mobile tilt effect
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate movement from touch start
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Calculate tilt based on finger position relative to card center
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const relativeX = (touch.clientX - centerX) / (rect.width / 2);
    const relativeY = (touch.clientY - centerY) / (rect.height / 2);
    
    // 3D tilt (max ±12 degrees for more noticeable effect on mobile)
    const rotateY = Math.max(-12, Math.min(12, relativeX * 12 + deltaX * 0.1));
    const rotateX = Math.max(-12, Math.min(12, -relativeY * 12 - deltaY * 0.1));
    
    setTransform({ rotateX, rotateY, imgX: relativeX * -15, imgY: relativeY * -15 });
  };

  const handleTouchEnd = () => {
    // Reset transform smoothly
    setTransform({ rotateX: 0, rotateY: 0, imgX: 0, imgY: 0 });
  };

  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform({ rotateX: 0, rotateY: 0, imgX: 0, imgY: 0 });
  };

  // On mobile, always show content
  const showContent = isMobile || isHovered;

  return (
    <div 
      ref={cardRef}
      className="portal-card-container"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        perspective: '800px',
        perspectiveOrigin: '50% 50%'
      }}
    >
      <div 
        className="portal-card-inner"
        style={{
          position: 'relative',
          aspectRatio: '4 / 3',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
          transition: (isHovered || isMobile) ? 'transform 0.15s ease-out' : 'transform 0.4s cubic-bezier(0.2, 0.715, 0.205, 0.99)',
          borderRadius: isMobile ? '8px' : '12px',
          overflow: 'hidden'
        }}
      >
        {/* 傳送門框架 (遮罩邊框) */}
        <div 
          className="portal-frame"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: isHovered 
              ? 'inset 0 0 40px rgba(6, 182, 212, 0.15), 0 20px 60px -20px rgba(0,0,0,0.6)'
              : 'inset 0 0 20px rgba(0,0,0,0.3)',
            zIndex: 3,
            pointerEvents: 'none',
            transition: 'box-shadow 0.4s ease'
          }}
        />

        {/* 背景深度層 */}
        <div 
          className="portal-depth"
          style={{
            position: 'absolute',
            inset: '-30px',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            transform: 'translateZ(-50px)',
            zIndex: 0
          }}
        />

        {/* 圖片層 (會移動產生視差) */}
        <div 
          className="portal-image-wrapper"
          style={{
            position: 'absolute',
            inset: '-20px',
            zIndex: 1,
            transform: `translate(${transform.imgX}px, ${transform.imgY}px) scale(${isHovered ? 1.08 : 1.05})`,
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s cubic-bezier(0.2, 0.715, 0.205, 0.99)'
          }}
        >
          <img 
            src={project.image} 
            alt={project.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: showContent ? 1 : 0.85,
              transition: 'opacity 0.4s ease'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* 內容遮罩層 */}
        <div 
          className="portal-content-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: isMobile 
              ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)'
              : 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
            opacity: showContent ? 1 : 0,
            transition: 'opacity 0.4s ease',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: isMobile ? '12px' : '24px',
            transform: 'translateZ(20px)'
          }}
        >
          {/* Client Name */}
          <span 
            style={{
              color: '#06b6d4',
              fontWeight: 700,
              fontSize: isMobile ? '0.6rem' : '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: isMobile ? '4px' : '8px',
              transform: showContent ? 'translateY(0)' : 'translateY(16px)',
              opacity: showContent ? 1 : 0,
              transition: 'transform 0.4s cubic-bezier(0.2, 0.715, 0.205, 0.99), opacity 0.3s ease'
            }}
          >
            {project.client}
          </span>
          {/* Project Title */}
          <h4 
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: isMobile ? '0.85rem' : '1.25rem',
              lineHeight: 1.3,
              marginBottom: '4px',
              transform: showContent ? 'translateY(0)' : 'translateY(16px)',
              opacity: showContent ? 1 : 0,
              transition: 'transform 0.4s cubic-bezier(0.2, 0.715, 0.205, 0.99) 0.05s, opacity 0.3s ease 0.05s'
            }}
          >
            {project.title}
          </h4>
          {/* Slogan - hidden on mobile for space */}
          {project.slogan && !isMobile && (
            <p 
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.875rem',
                marginBottom: '12px',
                transform: showContent ? 'translateY(0)' : 'translateY(16px)',
                opacity: showContent ? 1 : 0,
                transition: 'transform 0.4s cubic-bezier(0.2, 0.715, 0.205, 0.99) 0.1s, opacity 0.3s ease 0.1s'
              }}
            >
              {project.slogan}
            </p>
          )}
          {/* Category Tag - hidden on mobile */}
          {!isMobile && (
            <span 
              style={{
                display: 'inline-block',
                alignSelf: 'flex-start',
                padding: '4px 10px',
                background: 'rgba(6, 182, 212, 0.2)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                color: '#06b6d4',
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.02em',
                transform: showContent ? 'translateY(0)' : 'translateY(16px)',
                opacity: showContent ? 1 : 0,
                transition: 'transform 0.4s cubic-bezier(0.2, 0.715, 0.205, 0.99) 0.15s, opacity 0.3s ease 0.15s'
              }}
            >
              {project.category}
            </span>
          )}
        </div>

        {/* 光暈效果 */}
        <div 
          className="portal-glow"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: isMobile ? '8px' : '12px',
            background: `radial-gradient(circle at ${50 + transform.rotateY * 3}% ${50 - transform.rotateX * 3}%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)`,
            opacity: showContent ? 1 : 0,
            transition: 'opacity 0.4s ease',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  );
};
