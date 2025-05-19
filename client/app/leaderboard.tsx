import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://194.87.193.190.nip.io/user/leaderboard",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setLeaderboardData(data);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-yellow-50 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center text-black">
        <Trophy className="mr-2" /> LEADERBOARD
      </h1>
      <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center text-black">
        {" "}
        Кто первый заработает миллиард?
      </h2>

      {isLoading && (
        <div className="text-center py-4 text-lg text-gray-600">
          Загрузка данных...
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-red-500">
          Ошибка загрузки: {error}
        </div>
      )}

      <div className="overflow-y-auto flex-grow">
        <div className="bg-white rounded-lg shadow-md">
          {leaderboardData.length > 0 ? (
            leaderboardData.map((user, index) => (
              <div
                key={user.TelegramID}
                className={`flex items-center justify-between p-4 ${
                  index !== leaderboardData.length - 1
                    ? "border-b border-gray-200"
                    : ""
                } mb-2`}
              >
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-black">
                    {user.Name || `User ${user.TelegramID}`}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {user.Description || "No description"}
                  </p>
                </div>
                <div className="flex items-center justify-center bg-blue-100 text-blue-800 font-bold rounded-full px-4 py-2">
                  {user.Balance}
                </div>
              </div>
            ))
          ) : !isLoading ? (
            <div className="p-4 text-center text-gray-600">
              Нет данных в таблице лидеров
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
