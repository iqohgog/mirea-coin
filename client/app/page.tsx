"use client";
import { useState, useEffect } from "react";
import { Coins, ShoppingBag, Trophy, User } from "lucide-react";
import LeaderboardPage from "./leaderboard";
import ProfilePage from "./profile";
import StorePage from "./store";
import EarnPage from "./earn";

export default function BottomNavigationMenu() {
  const [activeTab, setActiveTab] = useState("earn");
  const [telegramReady, setTelegramReady] = useState(false);

  // Wait for Telegram WebApp to be initialized
  useEffect(() => {
    const checkTelegramWebApp = () => {
      if (window.Telegram?.WebApp?.initDataUnsafe) {
        setTelegramReady(true);
        return true;
      }
      return false;
    };

    // Check if already available
    if (checkTelegramWebApp()) return;

    // If not available, set up an interval to check
    const intervalId = setInterval(() => {
      if (checkTelegramWebApp()) {
        clearInterval(intervalId);
      }
    }, 100);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const renderContent = () => {
    if (!telegramReady) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to Telegram...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "earn":
        return <EarnPage />;
      case "store":
        return <StorePage />;
      case "leaderboard":
        return <LeaderboardPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <EarnPage />;
    }
  };

  const menuItems = [
    { id: "earn", label: "EARN", icon: <Coins size={28} /> },
    { id: "store", label: "STORE", icon: <ShoppingBag size={28} /> },
    { id: "leaderboard", label: "LEADERBOARD", icon: <Trophy size={28} /> },
    { id: "profile", label: "PROFILE", icon: <User size={28} /> },
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-auto">{renderContent()}</div>
      <div className="flex justify-around items-center bg-white border-t border-gray-200 h-24 px-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeTab === item.id ? "text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab(item.id)}
            disabled={!telegramReady}
          >
            <div className="mb-2">{item.icon}</div>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
