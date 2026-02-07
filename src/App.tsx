import { useEffect, useState, useRef, type FC, type FormEvent } from 'react';
import { ArrowRight, Target, MessageSquare, Linkedin, Terminal, Menu, X, Rocket, Wrench, Bot, Package, TrendingDown, TrendingUp, Coins, Zap, BarChart2, Sparkles, Crosshair, Users, HandMetal, Building2, Brain, Globe, ShieldCheck, Layers, LogOut } from 'lucide-react';
import { LoadingScreen, TransitionOverlay, SplitTextLine, HelloRotator, PortalCard } from './components/ui';
import { ShaderBackground } from './components/ShaderBackground';
import { ThreeBackground } from './components/ThreeBackground';
import { CylinderGrid } from './components/CylinderGrid';
import { submitContact, signInWithGoogle, logOut, onAuthChange } from './lib/firebase';
import type { User } from 'firebase/auth';
import './index.css';

type AudienceTab = 'agency' | 'brand';
type CapabilityIcon = typeof Sparkles;

interface CapabilityItem {
  icon: CapabilityIcon;
  title: string;
  subtitle: string;
  desc: string;
  benefits: string[];
  value?: string;
}

interface CapabilitySet {
  heading: string;
  headingSub: string;
  description: string;
  benefitsLabel: string;
  items: CapabilityItem[];
}

const capabilitySets: Record<AudienceTab, CapabilitySet> = {
  agency: {
    heading: 'The AI Growth Engine for Agencies',
    headingSub: 'Exclusive AI Growth Engine for Agencies',
    description: 'Build your agency\'s proprietary AI brain, enabling full automation from strategic insights to mass execution.',
    benefitsLabel: 'Key Benefits',
    items: [
      {
        icon: Brain,
        title: 'Custom Agency Brain',
        subtitle: 'Proprietary Creative Strategy Brain',
        desc: 'Using RAG (Retrieval-Augmented Generation) technology, transform your agency\'s award-winning cases, strategy modules, and creative styles into a proprietary AI model. Let AI learn your Tone & Manner to help junior staff quickly produce "director-level" strategy frameworks and pitch drafts.',
        benefits: [
          'Knowledge as Asset: Creativity no longer leaves with departing employees, but accumulates in your company\'s AI brain.',
          'Unleash Creative Energy: Reduce 70% of time spent on basic PPT work, letting creatives focus on Big Ideas.'
        ]
      },
      {
        icon: Rocket,
        title: 'Hyper-Scale Content Engine',
        subtitle: 'Massive Content Generation Engine',
        desc: 'Break through manpower limitations to achieve "one person equals a hundred" productivity. Through AI automation workflows, instantly multiply a single core idea (Big Idea) into thousands of designs and social media assets with different sizes, copy, and visual styles.',
        benefits: [
          'Matrix Generation: Support matrix-style content generation to quickly test material preferences across different target audiences.',
          'Zero Waste: Dramatically reduce execution waste and quickly respond to high-volume revision requests.'
        ]
      },
      {
        icon: Target,
        title: 'Client DNA & Pitch Intelligence',
        subtitle: 'Client Style Decoding & Pitch Optimization',
        desc: 'Stop guessing what clients like. Our engine analyzes past visual preferences and feedback records to build a Client DNA profile. Before pitching, use AI to predict and adjust styles, significantly improving pitch success rates.',
        benefits: [
          'Data-Driven Pitch: Ground pitch decisions in data, not guesswork.',
          'Increase Close Rate: Significantly improve pitch win rates and client satisfaction.'
        ]
      },
      {
        icon: Globe,
        title: 'AI-Native Interactive Production',
        subtitle: 'AI-Powered Interactive Experience Creation',
        desc: 'Beyond static assets, we provide high-end website production combining AI Agents with WebGL. From brand characters that engage deeply with users to dynamically generated visual webpages, add the most buzzworthy technical highlights to your creative projects.',
        benefits: [
          'Tech Highlight: Create immersive interactions and buzz that traditional websites cannot achieve.',
          'Full-Stack Support: You handle creativity, we handle all AI integration and frontend development.'
        ]
      }
    ]
  },
  brand: {
    heading: 'Enterprise AI Efficiency Engines',
    headingSub: 'Enterprise-Grade AI Efficiency Engines',
    description: 'Through AI integration into core workflows, achieve scalable production and automated management of marketing assets while reducing operational costs.',
    benefitsLabel: 'Efficiency Metrics',
    items: [
      {
        icon: ShieldCheck,
        title: 'Enterprise Brand Governance',
        subtitle: 'Enterprise Brand Governance Brain',
        value: 'Consistency & Risk Control',
        desc: 'Solve the common issues of "style drift" and "communication loss" in cross-department and cross-vendor collaboration. We build a proprietary Brand AI Model that internalizes brand guidelines (VI/Tone) into algorithms. It serves as your internal "AI Brand Compliance Officer," ensuring 100% guideline compliance for all outputs, dramatically reducing manual review and revision cycles.',
        benefits: [
          'Reduce Communication Costs: Cut revision rounds by 50%.',
          'Asset Reusability: Ensure all generated assets can be archived and reused long-term.'
        ]
      },
      {
        icon: Layers,
        title: 'Scalable Content Matrix',
        subtitle: 'Matrix-Style Content Supply Chain',
        value: 'Cost Efficiency & Scalability',
        desc: 'Build AI-automated production lines for massive e-commerce and social media content needs. This isn\'t about replacing designers—it\'s about solving repetitive manual labor. We can automatically multiply one Key Visual into thousands of assets in different sizes and formats, freeing your capacity from headcount limitations.',
        benefits: [
          'Decreasing Marginal Costs: 10x output increase with only 10% (or less) cost increase.',
          'Shorter Time-to-Market: Reduce new product asset preparation from weeks to hours.'
        ]
      },
      {
        icon: BarChart2,
        title: 'Creative Performance Optimization',
        subtitle: 'Creative Performance Optimization',
        value: 'Media Efficiency & Waste Reduction',
        desc: 'Stop relying on subjective intuition for decisions. Through data feedback, let AI analyze which visual elements and copy structures drive better clicks and retention. Our goal isn\'t to promise explosive growth, but to "reduce wasted budget," helping you achieve better traffic quality with the same media spend.',
        benefits: [
          'Lower CPA: Optimize materials, eliminate ineffective creatives, and improve ad efficiency.',
          'Data-Driven Decisions: Provide quantifiable creative analysis reports as benchmarks for future campaigns.'
        ]
      },
      {
        icon: Bot,
        title: 'Automated Service Experience',
        subtitle: 'Automated Service Experience',
        value: 'Service Automation & Engagement',
        desc: 'Deploy AI Agents to your brand website or experience store. They can handle repetitive product inquiries and tours 24/7, freeing human support to handle complex issues. Meanwhile, extend user dwell time through 3D virtual experiences, deepening brand impression.',
        benefits: [
          'Reduce Support Load: Automatically intercept and resolve 70% of common repetitive FAQ questions.',
          'Increase Brand Stickiness: Boost average Time on Site, deepening brand education.'
        ]
      }
    ]
  }
};

const CapabilityCard: FC<{ item: CapabilityItem; benefitsLabel: string }> = ({ item, benefitsLabel }) => {
  const Icon = item.icon;
  return (
    <div className="glass-card p-5 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl h-full flex flex-col gap-4 border border-white/10 bg-white/[0.02]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white">{item.title}</h3>
          <p className="text-xs sm:text-sm text-cyan-300/80 mt-1">{item.subtitle}</p>
        </div>
      </div>
      {item.value && (
        <p className="text-xs sm:text-sm text-gray-400">
          <span className="text-gray-500">Core Value: </span>{item.value}
        </p>
      )}
      <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{item.desc}</p>
      <div className="mt-auto">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{benefitsLabel}</p>
        <ul className="space-y-2">
          {item.benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start text-xs sm:text-sm text-gray-300">
              <span className="mr-2 text-cyan-500 mt-0.5 sm:mt-1 flex-shrink-0">▹</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const AudienceTabs: FC<{ value: AudienceTab; onChange: (next: AudienceTab) => void }> = ({ value, onChange }) => (
  <div className="flex justify-center">
    <div className="relative inline-flex bg-white/[0.03] backdrop-blur-sm rounded-2xl p-1.5 border border-white/10">
      <div 
        className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30 transition-all duration-300 ease-out"
        style={{ 
          left: value === 'agency' ? '6px' : 'calc(50% + 0px)',
        }}
      />
      <button
        onClick={() => onChange('agency')}
        className={`relative z-10 px-6 sm:px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
          value === 'agency' 
            ? 'text-white' 
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">For Agencies</span>
        <span className="sm:hidden">Agencies</span>
      </button>
      <button
        onClick={() => onChange('brand')}
        className={`relative z-10 px-6 sm:px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
          value === 'brand' 
            ? 'text-white' 
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">For Brands</span>
        <span className="sm:hidden">Brands</span>
      </button>
    </div>
  </div>
);

// --- Comparison Section - 簡化版（移除視差滾動） ---
const ComparisonSection: FC<{ activeTab: AudienceTab; onTabChange: (next: AudienceTab) => void }> = ({ activeTab, onTabChange }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);

  // 監聽滾動來計算縮放進度
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !stickyHeaderRef.current) return;
      
      const sectionRect = sectionRef.current.getBoundingClientRect();
      
      // 當 section 頂部碰到視窗頂部後開始計算進度
      if (sectionRect.top <= 0) {
        // 計算已經滾動進 section 的距離（用於縮放效果）
        const scrolledIntoSection = Math.abs(sectionRect.top);
        // 設定縮放效果的觸發範圍（例如滾動 200px 內完成縮放）
        const scaleRange = 200;
        const progress = Math.min(1, scrolledIntoSection / scaleRange);
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Data for agencies
  const agencyData = {
    header: {
      leftIcon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
      leftTitle: "Your Strengths",
      leftSub: "Creative Core",
      rightIcon: <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />, 
      rightTitle: "Our Support",
      rightSub: "Tech Enablement"
    },
    items: [
      {
        icon: <Crosshair className="w-5 h-5 sm:w-6 sm:h-6" />,
        label: "Core Division",
        left: "Brand strategy, storytelling & creative ideation",
        leftSub: "You come up with the amazing ideas",
        right: "Tech implementation, interactive dev, AI integration",
        rightSub: "We bring your ideas to life"
      },
      {
        icon: <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />,
        label: "Pain Points",
        left: "Great ideas but technically hard to execute",
        leftSub: "Engineers say it's impossible or too costly",
        right: "Break execution limits with AI tech",
        rightSub: "Rapid asset generation & automated development"
      },
      {
        icon: <Bot className="w-5 h-5 sm:w-6 sm:h-6" />,
        label: "AI Application",
        left: "Content generation assistants",
        leftSub: "Using AI for copywriting, storyboards",
        right: "Production-grade system development",
        rightSub: "Custom model training, AI interactive web development"
      },
      {
        icon: <Package className="w-5 h-5 sm:w-6 sm:h-6" />,
        label: "Deliverables",
        left: "A video, a series of visual designs",
        leftSub: "Visual and communication assets",
        right: "An interactive system, digital experience platform",
        rightSub: "Functional and experiential vehicles"
      },
      {
        icon: <HandMetal className="w-5 h-5 sm:w-6 sm:h-6" />,
        label: "Partnership",
        left: "Client (Account/PM)",
        leftSub: "Need more than outsourcing, need tech consulting",
        right: "Tech Partner",
        rightSub: "Feasibility assessment, joint pitching to win clients"
      }
    ]
  };

  // Data for brand clients
  const brandData = {
    header: {
      leftIcon: <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />,
      leftTitle: "Traditional Marketing",
      leftSub: "One-time Expense",
      rightIcon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />,
      rightTitle: "AI Digital Transformation",
      rightSub: "Asset Accumulation"
    },
    items: [
      {
        icon: <Coins className="w-5 h-5 sm:w-6 sm:h-6" />,
        label: "Budget Type",
        left: "Fireworks Budget (Expense)",
        leftSub: "Traffic and buzz disappear after campaign ends",
        right: "Digital Asset Investment (Asset)",
        rightSub: "Build owned platforms/systems for long-term operation"
      },
      {
        icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
        label: "Efficiency",
        left: "Relies on stacking manpower",
        leftSub: "Support, editing, copywriting costs scale with volume",
        right: "AI automation workflows",
        rightSub: "24/7 operation, larger scale means lower marginal costs"
      },
      {
        icon: <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />,
        label: "Data Value",
        left: "Only traffic metrics",
        leftSub: "Likes, reach—hard to monetize directly",
        right: "Deposits user behavior data",
        rightSub: "Collect precise user tags through interactive systems"
      },
      {
        icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" />,
        label: "Success Metrics",
        left: "Short-term Awareness",
        leftSub: "How many people saw this campaign",
        right: "Long-term Efficiency",
        rightSub: "How much manpower saved, how much conversion improved"
      },
      {
        icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />,
        label: "Why Choose Us",
        left: "If you need short-term exposure",
        leftSub: "Go with traditional ad agencies",
        right: "If you need automated customer acquisition systems",
        rightSub: "Talk to us"
      }
    ]
  };

  const currentData = activeTab === 'agency' ? agencyData : brandData;

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="relative bg-[#050505]/95 scroll-mt-24 py-16 sm:py-20 lg:py-24"
    >
      {/* WebGL 滾筒格子背景 */}
      <div className="absolute inset-0 z-0">
        <CylinderGrid />
      </div>
      
      {/* 靜態背景裝飾 */}
      <div 
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)'
        }}
      />
      
      {/* 內容區 */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        {/* 標題區 - Sticky Header */}
        <div 
          ref={stickyHeaderRef}
          className="sticky top-0 z-20 pt-16 sm:pt-20 pb-4 sm:pb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
        >
          {/* 背景層 - 分離架構避免毛玻璃和其他效果衝突 */}
          <div 
            className="absolute inset-0 -z-10"
            style={{
              background: 'rgba(5, 5, 5, 0.4)',
            }}
          />
          <div 
            className="absolute inset-0 -z-10 backdrop-blur-md"
            style={{
              WebkitBackdropFilter: 'blur(12px)',
              backdropFilter: 'blur(12px)',
            }}
          />
          
          <div className="max-w-6xl mx-auto w-full">
            <div 
              className="text-center transition-all duration-100 overflow-hidden"
              style={{
                marginBottom: `${8 * (1 - scrollProgress)}px`,
              }}
            >
              {/* Strategic Partnership 標籤 - 隨滾動消失 */}
              <div 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-medium tracking-wider uppercase transition-all duration-100 overflow-hidden"
                style={{
                  opacity: 1 - scrollProgress,
                  transform: `scale(${1 - scrollProgress * 0.3})`,
                  transformOrigin: 'center top',
                  maxHeight: scrollProgress >= 0.9 ? '0px' : '36px',
                  marginBottom: `${12 * (1 - scrollProgress)}px`,
                  padding: scrollProgress >= 0.8 ? '0' : undefined,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                Strategic Partnership
              </div>
              {/* Our Approach 標題 - 隨滾動縮小到 1/2，高度也縮小 */}
              <div 
                className="transition-all duration-100 overflow-hidden"
                style={{
                  // 使用 clamp 讓高度響應式：手機 40px, 平板 56px, 桌面 72px
                  height: `calc(clamp(40px, 8vw, 72px) * ${1 - scrollProgress * 0.5})`,
                  marginBottom: `${8 * (1 - scrollProgress)}px`,
                }}
              >
                <h2 
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold transition-all duration-100"
                  style={{ 
                    fontFamily: "'Space Grotesk', sans-serif",
                    transform: `scale(${1 - scrollProgress * 0.5})`,
                    transformOrigin: 'center top',
                    lineHeight: 1.1,
                  }}
                >
                  Our{' '}
                  <span 
                    className="approach-gradient-text"
                    style={{
                      background: 'linear-gradient(90deg, #8fafc7 0%, #ddd1d1 25%, #81adb8 50%, #ddd1d1 75%, #8fafc7 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Approach
                  </span>
                </h2>
              </div>
              {/* 副標題 - 也隨滾動消失 */}
              <p 
                className="text-sm sm:text-base text-gray-400 max-w-md mx-auto transition-all duration-100 overflow-hidden"
                style={{
                  opacity: 1 - scrollProgress,
                  transform: `scale(${1 - scrollProgress * 0.3})`,
                  transformOrigin: 'center top',
                  maxHeight: scrollProgress >= 0.9 ? '0px' : '24px',
                  marginBottom: 0,
                }}
              >
                Focused on tech execution, building accumulative digital assets for brands
              </p>
            </div>

            {/* Tab 切換器 */}
            <AudienceTabs value={activeTab} onChange={onTabChange} />
          </div>
        </div>

        {/* 卡片區域 - 簡單垂直列表 */}
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {currentData.items.map((item, index) => (
            <div 
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div data-approach-card className={`relative p-4 sm:p-5 rounded-2xl bg-[#050505]/90 backdrop-blur-sm border border-white/10 transition-all duration-300 overflow-hidden ${
                hoveredIndex === index ? 'border-cyan-500/30 bg-[#0a0a0a]/95' : ''
              }`}>
                {/* 頂部標籤列 */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-800/80 border border-white/10 flex items-center justify-center text-cyan-400 transition-transform duration-300 ${
                    hoveredIndex === index ? 'scale-110' : ''
                  }`}>
                    {item.icon}
                  </div>
                  <span className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">{item.label}</span>
                </div>

                {/* 對比區域 - 左右並排 + 箭頭 */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
                  {/* 左側 - Before */}
                  <div className={`flex-1 p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5 transition-transform duration-300 ${
                    hoveredIndex === index ? '-translate-x-1' : ''
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-gray-500">{currentData.header.leftIcon}</span>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{currentData.header.leftSub}</span>
                    </div>
                    <div className="text-sm sm:text-base text-gray-300 font-medium">{item.left}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">{item.leftSub}</div>
                  </div>

                  {/* 中間箭頭 */}
                  <div className="flex items-center justify-center py-1 sm:py-0">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center transition-all duration-300 ${
                      hoveredIndex === index ? 'scale-125 shadow-xl shadow-cyan-500/30' : ''
                    }`}>
                      <svg 
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 rotate-90 sm:rotate-0"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>

                  {/* 右側 - After (高亮) */}
                  <div className={`flex-1 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 transition-all duration-300 ${
                    hoveredIndex === index ? 'border-cyan-500/40 shadow-xl shadow-cyan-500/10 translate-x-1' : ''
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-cyan-400">{currentData.header.rightIcon}</span>
                      <span className="text-xs font-medium text-cyan-500 uppercase tracking-wider">{currentData.header.rightSub}</span>
                    </div>
                    <div className="text-sm sm:text-base text-white font-semibold">{item.right}</div>
                    <div className="text-xs sm:text-sm text-cyan-400/70 mt-1">{item.rightSub}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Contact Form Component - 使用 Google 登入驗證 ---
const ContactForm: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    message: '',
    budget: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 監聽登入狀態
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 如果還沒登入，先進行 Google 登入
    if (!user) {
      try {
        const loggedInUser = await signInWithGoogle();
        if (loggedInUser?.email) {
          // 登入成功，自動提交
          setIsSubmitting(true);
          await submitContact({
            ...formData,
            email: loggedInUser.email,
            name: formData.name || loggedInUser.displayName || 'Anonymous'
          });
          setSubmitStatus('success');
          setFormData({ name: '', company: '', message: '', budget: '' });
        }
      } catch {
        setSubmitStatus('error');
      } finally {
        setIsSubmitting(false);
        setTimeout(() => setSubmitStatus('idle'), 3000);
      }
      return;
    }
    
    // 已登入，直接提交
    setIsSubmitting(true);
    try {
      await submitContact({
        ...formData,
        email: user.email || '',
        name: formData.name || user.displayName || 'Anonymous'
      });
      setSubmitStatus('success');
      setFormData({ name: '', company: '', message: '', budget: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  // Google Icon
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  return (
    <div className="glass-card p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl text-left">
      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white flex items-center gap-2">
        <MessageSquare className="text-cyan-500 w-5 h-5 sm:w-6 sm:h-6" />
        Contact Us
      </h3>
      
      {/* 顯示登入狀態 */}
      {user && (
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-4">
          <div className="flex items-center gap-2">
            {user.photoURL && (
              <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
            )}
            <span className="text-sm text-gray-300 truncate max-w-[180px]">{user.email}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {submitStatus === 'success' ? (
        <div className="text-center py-6 sm:py-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Thank you for your message!</h4>
          <p className="text-gray-400 text-sm sm:text-base">We'll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <select
            name="budget"
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: e.target.value})}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-cyan-500 transition-colors"
            style={{ color: formData.budget ? '#fff' : '#6b7280' }}
          >
            <option value="" style={{ background: '#1a1a1a' }}>Budget Range</option>
            <option value="Under $15K" style={{ background: '#1a1a1a', color: '#fff' }}>Under $15K</option>
            <option value="$15K-$30K" style={{ background: '#1a1a1a', color: '#fff' }}>$15K-$30K</option>
            <option value="$30K-$100K" style={{ background: '#1a1a1a', color: '#fff' }}>$30K-$100K</option>
            <option value="$100K+" style={{ background: '#1a1a1a', color: '#fff' }}>$100K+</option>
            <option value="To be discussed" style={{ background: '#1a1a1a', color: '#fff' }}>To be discussed</option>
          </select>
          <textarea
            name="message"
            placeholder="Describe your project requirements *"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            required
            rows={3}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          />
          
          {user ? (
            // 已登入：顯示送出按鈕
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                isSubmitting 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black hover:scale-[1.01] shadow-lg shadow-cyan-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  Send Message
                </>
              )}
            </button>
          ) : (
            // 未登入：顯示 Google 登入按鈕
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-3 ${
                isSubmitting 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-white hover:bg-gray-100 text-gray-800 hover:scale-[1.01] shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Sign in with Google to Send
                </>
              )}
            </button>
          )}
          
          {!user && (
            <p className="text-gray-500 text-xs text-center">
              Sign in with Google to verify your email and send message
            </p>
          )}
          
          {submitStatus === 'error' && (
            <p className="text-red-400 text-xs sm:text-sm text-center">Submission failed. Please try again later.</p>
          )}
        </form>
      )}
    </div>
  );
};

// --- Process Roadmap Component - 手機版滑動卡片 ---
const ProcessRoadmap: FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const phases = [
    {
      label: 'Q1',
      title: 'Foundation & Brand',
      description: 'Brand revamp and foundation building.',
      detail: 'Visual identity upgrade (VI), 3D IP design, corporate website renewal with AI customer service integration to solve manpower challenges.',
      borderOpacity: '30'
    },
    {
      label: 'Q2-Q3',
      title: 'Campaign & Interaction',
      description: 'Marketing campaigns and interactive experiences.',
      detail: 'Build highly interactive campaign sites (WebGL) for product launches, integrating online and offline with WebSocket/Web3 technology.',
      borderOpacity: '80'
    },
    {
      label: 'Annual',
      title: 'Content & Optimization',
      description: 'Social content and traffic optimization.',
      detail: 'AI-generated workflows for rapid asset production, paired with monthly data analysis and continuous UI/UX optimization recommendations.',
      borderOpacity: '30'
    }
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStart;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const threshold = containerWidth * 0.2; // 滑動超過 20% 寬度就切換
    
    if (dragOffset < -threshold) {
      // 向左滑，下一張
      setActiveIndex(prev => Math.min(prev + 1, phases.length - 1));
    } else if (dragOffset > threshold) {
      // 向右滑，上一張
      setActiveIndex(prev => Math.max(prev - 1, 0));
    }
    // 吸附回去
    setDragOffset(0);
  };

  return (
    <section id="process" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-10 sm:mb-12 lg:mb-16 text-center" style={{fontFamily: "'Space Grotesk', sans-serif"}}>Digital Growth Engine</h2>
        
        {/* Desktop Version */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative">
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-900 via-cyan-500 to-cyan-900 z-0"></div>

          {phases.map((phase, index) => (
            <div 
              key={index}
              className={`relative z-10 bg-[#050505] p-5 sm:p-6 border-l-2 lg:border-l-0 lg:border-t-2 border-cyan-500/${phase.borderOpacity} lg:pt-12 sm:pt-14 ${index === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
            >
              <span className="text-4xl sm:text-5xl font-bold text-gray-800 absolute sm:-top-1 lg:-top-10 left-3 sm:left-4 lg:left-0 bg-[#050505] px-2 -z-10 sm:z-0">{phase.label}</span>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-cyan-400">{phase.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {phase.description}<br/>
                {phase.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Version - Swipeable Cards */}
        <div className="sm:hidden">
          <div 
            ref={containerRef}
            className="relative overflow-hidden py-2"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className={`flex ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
              style={{ 
                transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))` 
              }}
            >
              {phases.map((phase, index) => (
                <div 
                  key={index}
                  className="w-full flex-shrink-0 px-2 py-1"
                >
                  <div className="glass-card rounded-xl p-6 min-h-[220px]">
                    <span className="text-5xl font-bold text-cyan-500/20 block mb-2">{phase.label}</span>
                    <h3 className="text-xl font-bold mb-3 text-cyan-400">{phase.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {phase.description}<br/>
                      {phase.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {phases.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? 'bg-cyan-400 w-6' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Main App Component ---
function App({ skipLoading = false }: { skipLoading?: boolean }) {
  const [isLoading, setIsLoading] = useState(!skipLoading);
  const [showTransition, setShowTransition] = useState(false);
  const [navReady, setNavReady] = useState(skipLoading);
  const [contentReady, setContentReady] = useState(skipLoading);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [audienceTab, setAudienceTab] = useState<AudienceTab>('agency');
  const [coreScrollProgress, setCoreScrollProgress] = useState(0);
  
  // 視差滾動 - 使用 ref 直接操作 DOM 避免 re-render
  const heroContentRef = useRef<HTMLDivElement>(null);
  const helloRotatorRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const coreSectionRef = useRef<HTMLElement>(null);
  const coreStickyHeaderRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastScrollTime = useRef<number>(0);

  useEffect(() => {
    let ticking = false;
    
    const updateParallax = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // 計算 hero 區的滾動進度 (0 = 頂部, 1 = 完全離開視窗)
      const heroProgress = Math.min(1, scrollY / (windowHeight * 0.8));
      
      // 不同層的視差速度
      const parallaxY = scrollY * 0.4;  // 主內容較慢
      const rotatorParallaxY = scrollY * 0.25;  // HelloRotator 更慢（層次感）
      
      // 透明度隨滾動淡出
      const opacity = Math.max(0, 1 - heroProgress * 1.2);
      
      // 直接操作 DOM，不觸發 React re-render
      if (heroContentRef.current) {
        heroContentRef.current.style.transform = `translate3d(0, ${parallaxY}px, 0)`;
        heroContentRef.current.style.opacity = String(opacity);
      }
      if (helloRotatorRef.current) {
        helloRotatorRef.current.style.transform = `translate3d(0, ${rotatorParallaxY}px, 0)`;
        helloRotatorRef.current.style.opacity = String(Math.max(0, opacity * 1.1));  // 稍微比主內容晚淡出
      }
      
      ticking = false;
    };
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // 節流：限制更新頻率約 30fps（每 33ms 一次）
      const now = performance.now();
      if (now - lastScrollTime.current < 33) return;
      lastScrollTime.current = now;
      
      // 使用 requestAnimationFrame 確保在繪製前更新
      if (!ticking) {
        rafRef.current = requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!coreSectionRef.current || !coreStickyHeaderRef.current) return;
      
      const sectionRect = coreSectionRef.current.getBoundingClientRect();
      
      if (sectionRect.top <= 0) {
        const scrolledIntoSection = Math.abs(sectionRect.top);
        const scaleRange = 200;
        const progress = Math.min(1, scrolledIntoSection / scaleRange);
        setCoreScrollProgress(progress);
      } else {
        setCoreScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoadComplete = () => {
    setIsLoading(false);
    setShowTransition(true);
  };

  const handleNavStart = () => {
    setNavReady(true);
  };

  const handleTransitionComplete = () => {
    setTimeout(() => {
      setContentReady(true);
    }, 600);
  };

  // Sample projects data - 原版完整資料含 slogan
  const projects = [
    { id: "01", client: "Disney Pixar", title: "夢境開發拉", slogan: "腦筋急轉彎 探索心中浮現的情緒島", category: "Interactive Campaign", image: "/img/thumbs/1.png" },
    { id: "02", client: "Disney Concert", title: "迪士尼大銀幕音樂饗宴", slogan: "魔鏡魔鏡 誰是這場派對的主角", category: "Event Campaign Site", image: "/img/thumbs/2.png" },
    { id: "03", client: "NIKE", title: "為你的跑步之旅 找到最佳跑鞋", slogan: "找到最佳跑鞋 製作突破宣言", category: "Web Visual Design & Development", image: "/img/thumbs/3.png" },
    { id: "04", client: "QUAKER", title: "桂格5X B群 人蔘濃縮精華飲", slogan: "放膽翻轉世界 節奏由我", category: "Web Visual Design & Development", image: "/img/thumbs/4.png" },
    { id: "05", client: "TIANDIHEBU", title: "天地合補 EXX葡萄糖胺濃縮飲", slogan: "每日3效力 運動更有利", category: "Web Visual Design & Development", image: "/img/thumbs/5.png" },
    { id: "06", client: "ROYAL SALUTE", title: "為世界獻上滿星祝福", slogan: "客製專屬煙火 在星空為愛的人綻放", category: "Interactive Campaign", image: "/img/thumbs/6.png" },
    { id: "07", client: "MORINAGA", title: "森永牛奶糖雪派", slogan: "台灣登陸20週年 送好禮回饋", category: "Campaign Site", image: "/img/thumbs/7.png" },
    { id: "08", client: "BMW", title: "THE NEW 3: 任欲望覺醒", slogan: "任欲望覺醒 駕馭心中野性", category: "Web Visual Design & Development", image: "/img/thumbs/8.png" },
    { id: "09", client: "BMW", title: "THE NEW 3: 駕馭本能", slogan: "欲望所及 完美駕馭", category: "Web Visual Design & Development", image: "/img/thumbs/9.png" },
    { id: "10", client: "THE GLENLIVET", title: "乘著時光機 敬最初的自己", slogan: "重返初衷 探索品牌傳奇旅程", category: "Interactive Design & Dev", image: "/img/thumbs/10.png" },
    { id: "11", client: "GARMIN", title: "歡迎來到突破框架之門", slogan: "請點選旅行目的地 鎖定360度全景", category: "Web Visual Design & Development", image: "/img/thumbs/11.png" },
    { id: "12", client: "MEET TAIWAN", title: "High Five Taiwan", slogan: "感受台灣溫度 體驗在地熱情", category: "Interactive Design & Dev", image: "/img/thumbs/12.png" },
    { id: "13", client: "Mercedes-Benz", title: "Mercedes me connect", slogan: "智能互聯 駕馭未來的數位生活", category: "3D Interactive Experience", image: "/img/thumbs/13.png" },
  ];

  const navigation = [
    { name: 'Home', href: '#' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Process', href: '#process' },
    { name: 'Contact', href: '#contact' },
  ];

  const activeCapabilities = capabilitySets[audienceTab];

  return (
    <div className="min-h-screen bg-[#050505] text-white cyber-grid relative">
      {/* Loading Screen */}
      {isLoading && !skipLoading && <LoadingScreen onComplete={handleLoadComplete} />}
      
      {/* Transition Overlay */}
      <TransitionOverlay
        isPlaying={showTransition}
        onNavStart={handleNavStart}
        onComplete={handleTransitionComplete}
      />
      
      {/* Three.js Background */}
      <ThreeBackground />

      {/* Shader Gradient Background - visible across all sections */}
      <ShaderBackground />

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10 py-3 sm:py-4' : 'bg-transparent py-4 sm:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <a 
            href="#"
            className={`flex items-center gap-2 nav-item-animated ${navReady ? 'visible' : ''}`}
            style={{ transitionDelay: '0s' }}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img 
              src="/img/logopng.png" 
              alt="Universal FAW Labs Logo" 
              className="h-8 sm:h-10 w-auto object-contain cursor-pointer"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </a>
          
          <div className="hidden md:flex gap-4 lg:gap-8">
            {navigation.map((item, index) => (
              <a 
                key={item.name} 
                href={item.href} 
                className={`text-xs lg:text-sm font-medium text-gray-300 hover:text-cyan-400 uppercase tracking-wider lg:tracking-widest nav-item-animated transition-colors ${navReady ? 'visible' : ''}`}
                style={{ transitionDelay: `${0.2 * (index + 1)}s` }}
              >
                {item.name}
              </a>
            ))}
          </div>

          <button 
            className={`md:hidden text-white nav-item-animated p-2 -mr-2 ${navReady ? 'visible' : ''}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ transitionDelay: '1.2s' }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Fullscreen (獨立於 nav 之外) */}
      {/* 背景層 - 毛玻璃效果 */}
      <div 
        className={`md:hidden fixed inset-0 z-[100] transition-all duration-500 ease-out ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        style={{ 
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        onClick={() => setIsMenuOpen(false)}
      />
      
      {/* 內容層 - 選單文字 */}
      <div 
        className={`md:hidden fixed inset-0 z-[101] flex flex-col items-center justify-center ${
          isMenuOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        {/* Close button */}
        <button 
          className="absolute top-5 right-4 text-white p-2"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col gap-6 items-center text-center">
          {navigation.map((item, index) => (
            <a 
              key={item.name} 
              href={item.href} 
              className="text-2xl font-bold text-white hover:text-cyan-400 transition-all py-3"
              style={{
                transform: isMenuOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
                opacity: isMenuOpen ? 1 : 0,
                transition: `all 0.4s cubic-bezier(0.2, 0.715, 0.205, 0.99) ${index * 0.08}s`
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
        </div>
        
        {/* Footer in menu */}
        <div 
          className="absolute bottom-10 text-gray-500 text-sm"
          style={{
            opacity: isMenuOpen ? 1 : 0,
            transition: 'opacity 0.5s ease 0.4s'
          }}
        >
          akai@fawstudio.com
        </div>
      </div>

      {/* S1: Hero Section */}
      <section 
        ref={heroSectionRef}
        className="relative min-h-screen flex items-start px-[2.5%] sm:px-6 lg:px-8 overflow-hidden" 
        style={{ paddingTop: 'clamp(100px, 15vh, 140px)' }}
      >
        <div 
          ref={heroContentRef}
          className="max-w-7xl mx-auto relative z-10 w-full sm:w-full" 
          style={{ 
            width: '95%',
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)',  // 初始化 GPU 加速
          }}
        >
          <div 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-900/10 text-cyan-400 text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase mb-4 sm:mb-6"
            style={{ 
              opacity: contentReady ? 1 : 0, 
              transform: contentReady ? 'translateY(0)' : 'translateY(20px)', 
              transition: 'opacity 0.6s cubic-bezier(0.2, 0.715, 0.205, 0.99), transform 0.6s cubic-bezier(0.2, 0.715, 0.205, 0.99)' 
            }}
          >
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="hidden xs:inline">Creative Technologists for Future-Ready Brands</span>
            <span className="xs:hidden">Creative Technologists</span>
          </div>
          <h1 className="hero-title mb-6 sm:mb-8">
            <SplitTextLine text="We Build" delay={0.1} trigger={contentReady} />
            <SplitTextLine text="Digital Assets," delay={0.4} trigger={contentReady} isGradient={true} />
            <SplitTextLine text="Not Just Ads." delay={0.7} trigger={contentReady} />
          </h1>
	          <p 
	            className="text-sm sm:text-base lg:text-lg text-white max-w-xl lg:max-w-2xl mb-8 sm:mb-10 leading-relaxed" 
	            style={{ 
	              opacity: contentReady ? 1 : 0, 
	              transform: contentReady ? 'translateY(0)' : 'translateY(20px)', 
	              transition: 'opacity 0.8s cubic-bezier(0.2, 0.715, 0.205, 0.99) 1.3s, transform 0.8s cubic-bezier(0.2, 0.715, 0.205, 0.99) 1.3s' 
	            }}
	          >
	            Universal FAW Labs fuses strategy and frontier tech to build portable digital assets. Beautiful brands, powered by AI growth automation.
	          </p>
          <div className="flex flex-row gap-2 sm:gap-3">
            <a 
              href="#contact" 
              className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-cyan-500 hover:bg-cyan-400 text-black text-xs sm:text-sm lg:text-base font-bold rounded-full hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30"
              style={{ 
                opacity: contentReady ? 1 : 0, 
                transform: contentReady ? 'translateY(0)' : 'translateY(20px)', 
                transition: 'opacity 0.6s cubic-bezier(0.2, 0.715, 0.205, 0.99) 1.5s, transform 0.6s cubic-bezier(0.2, 0.715, 0.205, 0.99) 1.5s' 
              }}
            >
              Start Project <ArrowRight className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </a>
            <a 
              href="#portfolio" 
              className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 border border-white/20 hover:border-white/50 hover:bg-white/5 text-white text-xs sm:text-sm lg:text-base font-semibold rounded-full transition-all flex items-center justify-center"
              style={{ 
                opacity: contentReady ? 1 : 0, 
                transform: contentReady ? 'translateY(0)' : 'translateY(20px)', 
                transition: 'opacity 0.6s cubic-bezier(0.2, 0.715, 0.205, 0.99) 1.7s, transform 0.6s cubic-bezier(0.2, 0.715, 0.205, 0.99) 1.7s' 
              }}
            >
              View Our Work
            </a>
          </div>
        </div>

        {/* Hello Rotator - Bottom Right */}
        <div 
          ref={helloRotatorRef}
          className="absolute bottom-24 sm:bottom-8 right-4 sm:right-6 md:bottom-12 md:right-12"
          style={{ 
            zIndex: 10,
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)',  // 初始化 GPU 加速
          }}
        >
          <HelloRotator trigger={contentReady} />
        </div>

      </section>

      {/* Problem / Solution (Comparison) */}
      <ComparisonSection activeTab={audienceTab} onTabChange={setAudienceTab} />

      {/* S3: Services */}
      <section ref={coreSectionRef} id="services" className="relative bg-[#050505]/95 scroll-mt-24 py-16 sm:py-20 lg:py-24">
        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <div 
            ref={coreStickyHeaderRef}
            className="sticky top-0 z-20 pt-16 sm:pt-20 pb-4 sm:pb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
          >
            <div 
              className="absolute inset-0 -z-10"
              style={{
                background: 'rgba(5, 5, 5, 0.4)',
              }}
            />
            <div 
              className="absolute inset-0 -z-10 backdrop-blur-md"
              style={{
                WebkitBackdropFilter: 'blur(12px)',
                backdropFilter: 'blur(12px)',
              }}
            />
            <div className="max-w-6xl mx-auto w-full">
              <div 
                className="text-center transition-all duration-100 overflow-hidden"
                style={{
                  marginBottom: `${8 * (1 - coreScrollProgress)}px`,
                }}
              >
                <div 
                  className="transition-all duration-100 overflow-hidden"
                  style={{
                    height: `calc(clamp(40px, 8vw, 72px) * ${1 - coreScrollProgress * 0.5})`,
                    marginBottom: `${8 * (1 - coreScrollProgress)}px`,
                  }}
                >
                  <h2 
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold transition-all duration-100"
                    style={{ 
                      fontFamily: "'Space Grotesk', sans-serif",
                      transform: `scale(${1 - coreScrollProgress * 0.5})`,
                      transformOrigin: 'center top',
                      lineHeight: 1.1,
                    }}
                  >
                    Core{' '}
                    <span 
                      className="approach-gradient-text"
                      style={{
                        background: 'linear-gradient(90deg, #8fafc7 0%, #ddd1d1 25%, #81adb8 50%, #ddd1d1 75%, #8fafc7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      Capabilities
                    </span>
                  </h2>
                </div>
                <p 
                  className="text-sm sm:text-base text-gray-400 max-w-md mx-auto transition-all duration-100 overflow-hidden"
                  style={{
                    opacity: 1 - coreScrollProgress,
                    transform: `scale(${1 - coreScrollProgress * 0.3})`,
                    transformOrigin: 'center top',
                    maxHeight: coreScrollProgress >= 0.9 ? '0px' : '24px',
                    marginBottom: 0,
                  }}
                >
                  Four core engines driving brand digital transformation optimization
                </p>
              </div>
              <AudienceTabs value={audienceTab} onChange={setAudienceTab} />
            </div>
          </div>

          <div className="max-w-7xl mx-auto relative">
            <div className="max-w-5xl mx-auto text-center">
              <p className="text-xs uppercase tracking-wider text-cyan-400 mb-2">
                {audienceTab === 'agency' ? 'Agency Edition' : 'Brand Edition'}
              </p>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{activeCapabilities.heading}</h3>
              <p className="text-sm sm:text-base text-gray-400 mt-1">{activeCapabilities.headingSub}</p>
              <p className="text-sm sm:text-base text-gray-400 mt-3 leading-relaxed">{activeCapabilities.description}</p>
            </div>

            <div className="mt-8 sm:mt-10 grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {activeCapabilities.items.map((item) => (
                <CapabilityCard key={item.title} item={item} benefitsLabel={activeCapabilities.benefitsLabel} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* S4: Portfolio */}
      <section id="portfolio" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#080808]/95">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 lg:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-4" style={{fontFamily: "'Space Grotesk', sans-serif"}}>Featured Work</h2>
              <p className="text-sm sm:text-base text-gray-400 max-w-md">Experience helping agencies and brands, continuously growing</p>
            </div>
            <div className="hidden sm:block">
              <span className="text-cyan-500 font-mono text-sm">01 / {projects.length < 10 ? `0${projects.length}` : projects.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-5 lg:gap-6">
            {projects.map((project, index) => (
              <PortalCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* S5: Process / Roadmap */}
      <ProcessRoadmap />

      {/* S6: Footer / Contact */}
      <footer id="contact" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-cyan-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 lg:mb-8" style={{fontFamily: "'Space Grotesk', sans-serif"}}>Ready to Build Your Assets?</h2>
          <p className="text-sm sm:text-base lg:text-xl text-gray-400 mb-8 sm:mb-10 lg:mb-12 max-w-xl mx-auto leading-relaxed">
            From creativity to technical implementation, we help you build portable digital assets.<br className="hidden sm:block"/>
            Let Universal FAW Labs be your technology partner.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
            {/* Contact Info Card */}
            <div className="glass-card p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl text-left">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center text-xl sm:text-2xl font-bold flex-shrink-0">
                  <img src="/img/mepic.png" alt="Huang Akai" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold truncate">Huang Akai</h3>
                  <p className="text-cyan-400 text-xs sm:text-sm truncate">Founder, Universal FAW Labs</p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <a href="https://www.linkedin.com/in/huang-akai-41760570/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 sm:gap-4 text-gray-300 hover:text-white transition-colors cursor-pointer text-sm sm:text-base">
                  <Linkedin className="text-cyan-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Connect on LinkedIn</span>
                </a>
                <div className="flex items-center gap-3 sm:gap-4 text-gray-300 text-sm sm:text-base">
                  <MessageSquare className="text-cyan-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Let's Talk about your AI Strategy</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-gray-300 text-sm sm:text-base">
                  <Terminal className="text-cyan-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Ex-Ogilvy | Creative Technologist</span>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <ContactForm />
          </div>

          <div className="mt-12 sm:mt-16 lg:mt-20 pt-6 sm:pt-8 border-t border-white/5 text-gray-600 text-xs sm:text-sm">
            &copy; 2026 Universal FAW Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
