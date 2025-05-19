"use client";

import { useState, useEffect } from "react";
import { Coins, ShoppingBag, Trophy, User } from "lucide-react";
import LeaderboardPage from "./leaderboard";
// Компоненты для разных страниц
const EarnPage = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-blue-50 p-4">
    <h1 className="text-3xl font-bold mb-4">EARN</h1>
    <p className="text-lg text-center">
      Здесь пользователь может зарабатывать токены или баллы.
    </p>
  </div>
);

const StorePage = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-green-50 p-4">
    <h1 className="text-3xl font-bold mb-4">STORE</h1>
    <p className="text-lg text-center">
      Магазин с товарами, которые можно приобрести.
    </p>
  </div>
);

const ProfilePage = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-purple-50 p-4">
    <h1 className="text-3xl font-bold mb-4">PROFILE</h1>
    <p className="text-lg text-center">
      Личный профиль пользователя со статистикой.
    </p>
  </div>
);

export default function BottomNavigationMenu() {
  // Состояние для отслеживания активной вкладки
  const [activeTab, setActiveTab] = useState("earn");

  // Функция для рендеринга соответствующего контента
  const renderContent = () => {
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

  // Конфигурация кнопок меню
  const menuItems = [
    { id: "earn", label: "EARN", icon: <Coins size={28} /> },
    { id: "store", label: "STORE", icon: <ShoppingBag size={28} /> },
    { id: "leaderboard", label: "LEADERBOARD", icon: <Trophy size={28} /> },
    { id: "profile", label: "PROFILE", icon: <User size={28} /> },
  ];
  return (
    <div className="flex flex-col h-screen">
      {/* Контент страницы */}
      <div className="flex-grow overflow-auto">{renderContent()}</div>
      {/* Нижнее меню навигации */}
      <div className="flex justify-around items-center bg-white border-t border-gray-200 h-24 px-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeTab === item.id ? "text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <div className="mb-2">{item.icon}</div>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
