"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

// Компонент модального окна
function Modal({ item, onClose, onBuy }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-black"
        >
          <X size={20} />
        </button>
        <img
          src={`/${item.Image || "placeholder.png"}`}
          alt={item.Name}
          className="w-full h-48 object-contain rounded-md mb-4"
        />
        <h2 className="text-2xl text-black font-bold mb-2">{item.Name}</h2>
        <p className="text-black mb-4">{item.Description}</p>
        <p className="font-medium mb-4 text-black">Цена: {item.Cost} токенов</p>
        <button
          onClick={() => onBuy(item)}
          className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Купить
        </button>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [activeTab, setActiveTab] = useState<"clicks" | "auto">("clicks");
  const [items, setItems] = useState<any[]>([]);
  const [modalItem, setModalItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telegramID, setTelegramID] = useState<number | null>(null);

  // Инициализация Telegram WebApp и получение ID
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      console.error("Telegram WebApp не найден");
      return;
    }
    const user = tg.initDataUnsafe?.user;
    if (user?.id) {
      setTelegramID(user.id);
    } else {
      console.error("ID пользователя Telegram не найден");
    }
  }, []);

  // Fetch items при смене вкладки и наличии telegramID
  useEffect(() => {
    if (!telegramID) return;

    async function fetchItems() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://194.87.193.190.nip.io/store/${activeTab}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: telegramID }),
          }
        );
        if (!res.ok) throw new Error("Ошибка сети");
        const data = await res.json();
        const autoImages = [
          "auto-farm-1.png",
          "auto-farm-2.png",
          "auto-farm-3.jpg",
          "auto-farm-4.jpg",
          "auto-farm-5.jpg",
        ];
        const clickImages = [
          "click-boost-1.jpg",
          "click-boost-2.jpg",
          "click-boost-3.jpg",
          "click-boost-4.jpg",
          "click-boost-5.jpg",
        ];
        const updatedData = data.map((item, index) => {
          if (activeTab === "auto") {
            return { ...item, Image: autoImages[index % autoImages.length] };
          } else {
            return { ...item, Image: clickImages[index % clickImages.length] };
          }
        });
        setItems(updatedData);
      } catch (e) {
        console.error(e);
        setError("Не удалось загрузить товары");
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [activeTab, telegramID]);

  const handleBuy = async (item: any) => {
    if (!telegramID) {
      alert("Не удалось определить ID пользователя");
      return;
    }
    try {
      const res = await fetch("https://194.87.193.190.nip.io/store/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: telegramID,
          store: activeTab === "clicks" ? "click" : "auto",
          Name: item.Name,
        }),
      });
      if (!res.ok) {
        alert("Недостаточно средств");
      } else {
        alert("Покупка успешна!");
        setItems((prev) =>
          prev.map((it) =>
            it.ID === item.ID
              ? {
                  ...it,
                  Quantity: it.Quantity + 1,
                  Cost: it.Cost * it.Coefficient,
                }
              : it
          )
        );
        setModalItem(null);
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка при покупке");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Вкладки */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-2 text-center font-medium transition ${
            activeTab === "clicks"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-black"
          }`}
          onClick={() => setActiveTab("clicks")}
        >
          Улучшение клика
        </button>
        <button
          className={`flex-1 py-2 text-center font-medium transition ${
            activeTab === "auto"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-black"
          }`}
          onClick={() => setActiveTab("auto")}
        >
          Автоматическая добыча
        </button>
      </div>

      {/* Содержимое */}
      <div className="flex-1 overflow-auto p-4 grid grid-cols-2 gap-4">
        {loading && <p>Загрузка...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading &&
          !error &&
          items.map((item) => (
            <div
              key={item.ID}
              className="bg-gray-50 rounded-lg p-4 flex flex-col items-center cursor-pointer hover:shadow-md transition"
              onClick={() => setModalItem(item)}
            >
              <img
                src={`/${item.Image || "placeholder.png"}`}
                alt={item.Name}
                className="w-24 h-24 object-cover rounded-md mb-2"
              />
              <h3 className="font-medium text-black text-lg mb-1 text-center">
                {item.Name}
              </h3>
              <span className="text-sm text-black">{item.Cost} токенов</span>
            </div>
          ))}
      </div>

      {/* Модалка */}
      <Modal
        item={modalItem}
        onClose={() => setModalItem(null)}
        onBuy={handleBuy}
      />
    </div>
  );
}
