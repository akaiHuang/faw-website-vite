import { useState, useEffect, useRef, type FC } from 'react';
import { onAuthChange, signInWithGoogle, logOut, requestNotificationPermission, saveFCMToken, onForegroundMessage } from './lib/firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import { database } from './lib/firebase';
import type { User } from 'firebase/auth';

// VAPID Key - 你需要在 Firebase Console > Cloud Messaging 產生
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

// Icons
const IconWrapper: FC<{ children: React.ReactNode; size?: number; className?: string }> = ({ 
  children, size = 24, className = "" 
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

const Users: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></IconWrapper>;
const Mail: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></IconWrapper>;
const Building: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></IconWrapper>;
const DollarSign: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></IconWrapper>;
const Clock: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></IconWrapper>;
const MessageSquare: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></IconWrapper>;
const Trash: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></IconWrapper>;
const Check: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><path d="M20 6 9 17l-5-5"/></IconWrapper>;
const RefreshCw: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></IconWrapper>;
const ArrowLeft: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></IconWrapper>;
const LogOut: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></IconWrapper>;
const Shield: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></IconWrapper>;
const Bell: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></IconWrapper>;
const BellOff: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"/><path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><line x1="2" x2="22" y1="2" y2="22"/></IconWrapper>;
const Share: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></IconWrapper>;
const X: FC<{ size?: number; className?: string }> = (props) => <IconWrapper {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconWrapper>;

// Google Icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Contact data type
interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  budget?: string;
  timestamp: number;
  status?: 'new' | 'pending' | 'contacted';
}

// 檢測是否為 iOS Safari
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
};

// 檢測是否已安裝為 PWA
const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (navigator as unknown as { standalone?: boolean }).standalone === true;
};

// iOS 安裝提示組件
const InstallPrompt: FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center p-4">
      <div className="glass-card rounded-2xl p-6 max-w-sm w-full mb-4 animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Bell className="text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">加入主畫面</h3>
              <p className="text-sm text-gray-400">接收即時推播通知</p>
            </div>
          </div>
          <button onClick={onDismiss} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-300 mb-3">
            iOS Safari 需要將網站加入主畫面才能接收推播：
          </p>
          <ol className="text-sm text-gray-400 space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center text-xs text-cyan-400 flex-shrink-0 mt-0.5">1</span>
              <span>點擊 Safari 底部的 <Share size={16} className="inline text-cyan-400 mx-1" /> 分享按鈕</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center text-xs text-cyan-400 flex-shrink-0 mt-0.5">2</span>
              <span>向下滑動，選擇「加入主畫面」</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center text-xs text-cyan-400 flex-shrink-0 mt-0.5">3</span>
              <span>從主畫面開啟 App，並允許通知權限</span>
            </li>
          </ol>
        </div>

        {/* 示意圖 - Safari 分享按鈕 */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-300">
            <Share size={18} className="text-cyan-400" />
            <span>← 點這個分享按鈕</span>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-xl transition-colors"
        >
          我知道了
        </button>
      </div>
    </div>
  );
};

// PWA 推播提示組件
const PushPrompt: FC<{ onEnable: () => void; onDismiss: () => void }> = ({ onEnable, onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 max-w-sm w-full animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Bell className="text-cyan-400" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white">開啟推播通知</h3>
              <p className="text-sm text-gray-400">即時收到新訊息通知</p>
            </div>
          </div>
          <button onClick={onDismiss} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-300">
            開啟推播通知後，當有新的聯絡表單提交時，你會立即收到通知，即使 App 在背景也能收到。
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
          >
            稍後再說
          </button>
          <button
            onClick={onEnable}
            className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-xl transition-colors"
          >
            開啟推播
          </button>
        </div>
      </div>
    </div>
  );
};

// 登入頁面組件
const LoginPage: FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
      setError('登入失敗，請確認您的帳號有存取權限');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
      <div className="max-w-md w-full">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="mb-6">
            <img src="/img/logopng.png" alt="FAW Labs" className="h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white" style={{fontFamily: "'Space Grotesk', sans-serif"}}>
              後台管理系統
            </h1>
            <p className="text-gray-400 text-sm mt-2">請使用 Google 帳號登入</p>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm">
              <Shield size={16} />
              <span>僅限授權帳號登入</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-3 disabled:opacity-50 bg-white text-gray-800 hover:bg-gray-100 transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-gray-600" />
            ) : (
              <>
                <GoogleIcon />
                <span>使用 Google 登入</span>
              </>
            )}
          </button>

          <p className="text-gray-500 text-xs mt-6">
            權限由 Firebase Security Rules 控制
          </p>
        </div>
      </div>
    </div>
  );
};

// 狀態標籤
const StatusBadge: FC<{ status?: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    new: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    contacted: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  };
  const labels: Record<string, string> = {
    new: '新訊息',
    contacted: '已聯絡',
    pending: '處理中'
  };
  const key = status || 'new';
  return (
    <span className={`px-2 py-1 text-xs rounded-full border ${styles[key] || styles.new}`}>
      {labels[key] || '新訊息'}
    </span>
  );
};

// 主後台組件
const AdminDashboard: FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0 });
  
  // 推播相關狀態
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const initialLoadDone = useRef(false);
  const lastContactCount = useRef(0);
  const lastNotifiedId = useRef<string | null>(null);

  // 檢查通知權限狀態 & iOS 自動提示
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationEnabled(Notification.permission === 'granted');
      
      // PWA 模式下，如果還沒開啟推播，自動彈出提示
      const hasSeenPushPrompt = localStorage.getItem('faw-push-prompt-seen');
      if (isStandalone() && Notification.permission === 'default' && !hasSeenPushPrompt) {
        setTimeout(() => setShowPushPrompt(true), 1500);
      }
    }
    
    // iOS Safari 自動顯示安裝提示（如果尚未加入主畫面且未曾關閉過提示）
    const hasSeenPrompt = localStorage.getItem('faw-install-prompt-seen');
    if (isIOS() && !isStandalone() && !hasSeenPrompt) {
      // 延遲一下再顯示，讓頁面先載入
      setTimeout(() => setShowInstallPrompt(true), 1000);
    }
  }, []);

  // 監聽前景訊息
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground message:', payload);
      // 前景時顯示自訂通知 toast
      if (Notification.permission === 'granted') {
        new Notification('📬 You Got Mail!', {
          body: 'You have a new contact message',
          icon: '/img/logopng.png'
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // 請求推播權限
  const handleEnableNotifications = async () => {
    // iOS Safari 需要先加到主畫面
    if (isIOS() && !isStandalone()) {
      setShowInstallPrompt(true);
      return;
    }

    setNotificationLoading(true);
    try {
      console.log('=== Starting notification setup ===');
      console.log('Current permission:', Notification.permission);
      console.log('Is iOS:', isIOS());
      console.log('Is Standalone:', isStandalone());
      console.log('VAPID_KEY exists:', !!VAPID_KEY);
      
      // 嘗試註冊 FCM
      if (VAPID_KEY) {
        try {
          console.log('Calling requestNotificationPermission...');
          const token = await requestNotificationPermission(VAPID_KEY);
          console.log('FCM Token received:', token ? token.substring(0, 30) + '...' : 'null');
          
          // 儲存 token
          console.log('Saving token for user:', user.uid);
          await saveFCMToken(user.uid, token);
          console.log('FCM Token saved successfully!');
          
          setNotificationEnabled(true);
          
          // 顯示成功通知
          new Notification('🎉 推播已啟用', {
            body: '當有新訊息時，你會收到背景推播通知',
            icon: '/img/logopng.png'
          });
          
          alert('✅ 推播通知已成功啟用！\n\n你現在可以在背景收到新訊息通知。');
        } catch (fcmError) {
          console.error('FCM registration error:', fcmError);
          const errorMsg = fcmError instanceof Error ? fcmError.message : String(fcmError);
          
          // iOS Safari 特殊處理
          if (isIOS()) {
            alert(`❌ iOS Safari FCM 限制\n\n錯誤: ${errorMsg}\n\n目前 iOS Safari 對 FCM 的支援有限。\n\n替代方案：你可以在網頁開啟時收到前景通知，但背景推播可能無法運作。`);
            
            // 仍然啟用前景通知
            if (Notification.permission === 'granted') {
              setNotificationEnabled(true);
            }
          } else {
            alert(`❌ FCM 註冊失敗\n\n${errorMsg}\n\n請檢查瀏覽器控制台以獲取更多資訊。`);
          }
        }
      } else {
        console.warn('VAPID_KEY is not set!');
        alert('⚠️ VAPID_KEY 未設定，無法使用背景推播');
      }
    } catch (err) {
      console.error('Notification error:', err);
      alert('發生錯誤: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setNotificationLoading(false);
    }
  };

  // 讀取資料
  useEffect(() => {
    const contactsRef = ref(database, 'contacts');
    
    const unsubscribe = onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contactList: Contact[] = Object.entries(data).map(([id, value]) => ({
          id,
          ...(value as Omit<Contact, 'id'>)
        })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        // 檢測新訊息並發送通知
        if (initialLoadDone.current && contactList.length > lastContactCount.current) {
          const newestContact = contactList[0];
          if (newestContact && newestContact.id !== lastNotifiedId.current && Notification.permission === 'granted') {
            lastNotifiedId.current = newestContact.id;
            new Notification('📬 You Got Mail!', {
              body: `New message from ${newestContact.name}`,
              icon: '/img/logopng.png',
              tag: 'new-contact'
            });
          }
        }
        lastContactCount.current = contactList.length;
        
        setContacts(contactList);
        setStats({
          total: contactList.length,
          new: contactList.filter(c => !c.status || c.status === 'new').length,
          contacted: contactList.filter(c => c.status === 'contacted').length
        });
      } else {
        setContacts([]);
        setStats({ total: 0, new: 0, contacted: 0 });
      }
      setLoading(false);
      
      // 標記初始載入完成
      if (!initialLoadDone.current) {
        setTimeout(() => {
          initialLoadDone.current = true;
        }, 500);
      }
    }, (err) => {
      console.error('Firebase Error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 更新狀態
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await update(ref(database, `contacts/${id}`), { status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // 刪除聯絡資料
  const deleteContact = async (id: string) => {
    if (window.confirm('確定要刪除這筆資料嗎？')) {
      try {
        await remove(ref(database, `contacts/${id}`));
        setSelectedContact(null);
      } catch (err) {
        console.error('Error deleting contact:', err);
      }
    }
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '未知';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center max-w-lg mx-auto p-8 glass-card rounded-xl">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Firebase 權限錯誤</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-gray-500 text-sm mb-4">
            請確認 Firebase Security Rules 已設定允許你的 email 讀取資料
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* iOS 安裝提示 */}
      {showInstallPrompt && (
        <InstallPrompt onDismiss={() => {
          localStorage.setItem('faw-install-prompt-seen', 'true');
          setShowInstallPrompt(false);
        }} />
      )}
      
      {/* PWA 推播提示 */}
      {showPushPrompt && (
        <PushPrompt 
          onEnable={() => {
            localStorage.setItem('faw-push-prompt-seen', 'true');
            setShowPushPrompt(false);
            handleEnableNotifications();
          }}
          onDismiss={() => {
            localStorage.setItem('faw-push-prompt-seen', 'true');
            setShowPushPrompt(false);
          }} 
        />
      )}
      
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </a>
            <div>
              <h1 className="text-xl font-bold text-white" style={{fontFamily: "'Space Grotesk', sans-serif"}}>
                FAW Labs 後台管理
              </h1>
              <p className="text-sm text-gray-500">聯絡表單管理系統</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <img 
                src={user.photoURL || 'https://via.placeholder.com/32'} 
                alt={user.displayName || ''}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-400">{user.email}</span>
            </div>
            
            {/* 推播按鈕 - 手機版更明顯 */}
            <button
              onClick={handleEnableNotifications}
              disabled={notificationLoading || notificationEnabled}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                notificationEnabled 
                  ? 'text-green-400 bg-green-500/20 border border-green-500/30' 
                  : 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 animate-pulse'
              }`}
              title={notificationEnabled ? '推播已啟用' : '啟用推播通知'}
            >
              {notificationLoading ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : notificationEnabled ? (
                <Bell size={20} />
              ) : (
                <BellOff size={20} />
              )}
              <span className="sm:inline">
                {notificationEnabled ? '已啟用' : '開啟推播'}
              </span>
            </button>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">登出</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">總詢問數</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Users className="text-cyan-400" />
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">新訊息</p>
                <p className="text-3xl font-bold text-cyan-400 mt-1">{stats.new}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Mail className="text-cyan-400" />
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">已聯絡</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{stats.contacted}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Check className="text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact List */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="font-bold text-lg text-white">聯絡記錄</h2>
              </div>
              
              {contacts.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">尚無聯絡記錄</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id ? 'bg-cyan-500/10 border-l-2 border-cyan-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white truncate">{contact.name}</h3>
                            <StatusBadge status={contact.status} />
                          </div>
                          <p className="text-sm text-gray-400 truncate">{contact.email}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{contact.message}</p>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="text-xs text-gray-500">{formatDate(contact.timestamp)}</p>
                          {contact.budget && (
                            <p className="text-xs text-cyan-400 mt-1">{contact.budget}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedContact ? (
              <div className="glass-card rounded-xl p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg text-white">詳細資訊</h2>
                  <button
                    onClick={() => deleteContact(selectedContact.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Users size={14} />
                      姓名
                    </div>
                    <p className="text-white font-medium">{selectedContact.name}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Mail size={14} />
                      Email
                    </div>
                    <a href={`mailto:${selectedContact.email}`} className="text-cyan-400 hover:underline">
                      {selectedContact.email}
                    </a>
                  </div>

                  {selectedContact.company && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Building size={14} />
                        公司
                      </div>
                      <p className="text-white">{selectedContact.company}</p>
                    </div>
                  )}

                  {selectedContact.budget && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <DollarSign size={14} />
                        預算範圍
                      </div>
                      <p className="text-white">{selectedContact.budget}</p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Clock size={14} />
                      送出時間
                    </div>
                    <p className="text-white">{formatDate(selectedContact.timestamp)}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <MessageSquare size={14} />
                      訊息內容
                    </div>
                    <p className="text-white bg-white/5 p-3 rounded-lg text-sm leading-relaxed">
                      {selectedContact.message}
                    </p>
                  </div>

                  {/* Status Actions */}
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm mb-3">更新狀態</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(selectedContact.id, 'new')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedContact.status === 'new' || !selectedContact.status
                            ? 'bg-cyan-500 text-black'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        新訊息
                      </button>
                      <button
                        onClick={() => updateStatus(selectedContact.id, 'pending')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedContact.status === 'pending'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        處理中
                      </button>
                      <button
                        onClick={() => updateStatus(selectedContact.id, 'contacted')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedContact.status === 'contacted'
                            ? 'bg-green-500 text-black'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        已聯絡
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-12 text-center">
                <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">點選左側記錄查看詳情</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 主應用程式
const Admin: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
};

export default Admin;
