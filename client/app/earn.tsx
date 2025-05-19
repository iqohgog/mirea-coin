"use client";
import { useState, useEffect } from "react";

export default function EarnPage() {
  const [balance, setBalance] = useState(0);
  const [maxTokens, setMaxTokens] = useState(10000);
  const [tokensPerSecond, setTokensPerSecond] = useState(0);
  const [clickCost, setClickCost] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const telegramID = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const firstName = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name;
  const lastName = window.Telegram?.WebApp?.initDataUnsafe?.user?.last_name;
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();

  const baseURL = "https://194.87.193.190.nip.io";

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${baseURL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: telegramID,
          username: fullName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (data) {
        setBalance(data.balance);
        setMaxTokens(data.max_tokens);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
    }
  };

  const fetchClickCost = async () => {
    try {
      const response = await fetch(`${baseURL}/user/cost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: telegramID,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch click cost");
      }

      const data = await response.json();

      if (typeof data === "number") {
        setClickCost(data);
      } else if (data && data.cost) {
        setClickCost(data.cost);
      }
    } catch (err) {
      console.error("Error fetching click cost:", err);
    }
  };

  const fetchAutoClickRate = async () => {
    try {
      const response = await fetch(`${baseURL}/user/auto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: telegramID,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch auto click rate");
      }

      const data = await response.json();
      if (typeof data === "number") {
        setTokensPerSecond(data);
      } else if (data && data.cost) {
        setTokensPerSecond(data.cost);
      }
    } catch (err) {
      console.error("Error fetching auto click rate:", err);
    }
  };

  const handleClick = async () => {
    try {
      const response = await fetch(`${baseURL}/user/click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: telegramID,
          clicks: clickCost,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process click");
      }

      fetchUserData();
      fetchClickCost();
    } catch (err) {
      console.error("Error processing click:", err);
    }
  };

  useEffect(() => {
    const preventScroll = (e) => {
      e.preventDefault();
    };

    const preventDefaultTouchMove = (e) => {
      if (
        Math.abs(e.touches[0].clientY - startY) >
        Math.abs(e.touches[0].clientX - startX)
      ) {
        e.preventDefault();
      }
    };

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    document.addEventListener("wheel", preventScroll, { passive: false });
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", preventDefaultTouchMove, {
      passive: false,
    });

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";

      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", preventDefaultTouchMove);
    };
  }, []);

  useEffect(() => {
    if (telegramID) {
      const initializeData = async () => {
        setIsLoading(true);
        await fetchUserData();
        await fetchClickCost();
        await fetchAutoClickRate();
        setIsLoading(false);
      };

      initializeData();

      const userDataInterval = setInterval(fetchUserData, 3000);
      const autoClickInterval = setInterval(fetchAutoClickRate, 5000);

      return () => {
        clearInterval(userDataInterval);
        clearInterval(autoClickInterval);
      };
    } else {
      setError("Telegram user data not available");
      setIsLoading(false);
    }
  }, [telegramID]);

  const progressPercentage = maxTokens > 0 ? (balance / maxTokens) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-50">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-between h-screen bg-blue-50 p-4 pb-8"
      style={{ touchAction: "none" }}
    >
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-black">
          EARN TOKENS
        </h1>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-gray-500 text-sm ">Current Balance</div>
            <div className="text-2xl font-bold text-black">
              {balance} / {maxTokens}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-gray-500 text-sm">Tokens per Second</div>
            <div className="text-2xl text-black font-bold">
              {tokensPerSecond}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center flex-grow justify-center">
        <button
          onClick={handleClick}
          className="relative w-70 h-70 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg transition-transform transform active:scale-95 flex items-center justify-center mb-4 select-none user-select-none"
          style={{
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            userSelect: "none",
            touchAction: "manipulation",
          }}
        >
          <img
            src="/click-icon.png"
            alt="Click Button"
            className="absolute inset-0 w-full h-full object-cover rounded-full pointer-events-none"
            draggable="false"
          />
        </button>
        <div className="text-lg font-medium text-black text-center">
          Tap to earn {clickCost} tokens!
        </div>
      </div>
    </div>
  );
}
