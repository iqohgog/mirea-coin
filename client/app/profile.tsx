"use client";
import { useEffect, useState } from "react";

const ProfilePage = () => {
  const [userData, setUserData] = useState<any>(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const telegramID = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    const firstName = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name;
    const lastName = window.Telegram?.WebApp?.initDataUnsafe?.user?.last_name;
    const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();

    const fetchUser = async () => {
      try {
        const response = await fetch("https://194.87.193.190.nip.io/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: telegramID, username: fullName }),
        });

        if (!response.ok) throw new Error("Ошибка ответа сервера");

        const data = await response.json();
        setUserData({ ...data, name: fullName, telegramID });
        setDescription(data.description || "");
      } catch (error) {
        console.error("Ошибка при загрузке данных пользователя:", error);
      }
    };

    if (telegramID) fetchUser();
  }, []);

  const handleDescriptionChange = (e: any) => setDescription(e.target.value);

  const saveDescription = async () => {
    try {
      await fetch("https://194.87.193.190.nip.io/user/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userData.telegramID, description }),
      });
    } catch (error) {
      console.error("Ошибка при сохранении описания:", error);
    }
  };

  if (!userData) {
    return <div className="p-4 text-black">Загрузка профиля...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-purple-50 p-4 text-black">
      <h1 className="text-3xl font-bold mb-4 text-black">PROFILE</h1>
      <p className="text-lg mb-2">
        <strong>Имя:</strong> {userData.name}
      </p>
      <p className="text-lg mb-2">
        <strong>Баланс:</strong> {userData.balance}
      </p>

      <div className="w-full mt-6">
        <label className="block text-sm font-medium mb-1">Описание:</label>
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          className="w-full p-2 border border-gray-300 rounded text-black"
          rows={3}
        />
        <button
          onClick={saveDescription}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Сохранить описание
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
