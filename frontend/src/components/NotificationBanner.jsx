import React, { useState, useEffect } from 'react';

export default function NotificationBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    if (localStorage.getItem('tvr_notif_dismissed')) return;
    const timer = setTimeout(() => setShow(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    await Notification.requestPermission();
    setShow(false);
    localStorage.setItem('tvr_notif_dismissed', '1');
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('tvr_notif_dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-sm bg-[#0f1f3d] border border-blue-800 rounded-xl shadow-2xl p-4 flex items-start gap-3">
      <div className="text-2xl mt-0.5">🔔</div>
      <div className="flex-1">
        <p className="text-white text-sm font-semibold leading-snug">Get breaking startup news</p>
        <p className="text-slate-400 text-xs mt-0.5">Enable notifications for real-time funding alerts and unicorn updates.</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAllow}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Allow
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-slate-400 hover:text-slate-200 text-xs transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
