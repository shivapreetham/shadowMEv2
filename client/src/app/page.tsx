"use client";

import { useState } from "react";

interface AttendanceData {
  slNo: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  presentTotal: string;
  attendancePercentage: string;
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScrape = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://shadowmev2.onrender.com/scrape-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch attendance");
      console.log(data)
      // data is expected to be an array of valid attendance records after filtering on the backend.
      setAttendance(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Attendance Scraper</h2>
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />
        <button
          onClick={handleScrape}
          className="w-full bg-blue-500 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Fetching..." : "Get Attendance"}
        </button>
        {error && <p className="text-red-500 mt-3">{error}</p>}
      </div>

      {attendance.length > 0 && (
        <table className="mt-6 w-full max-w-2xl border-collapse border border-gray-400 bg-white shadow-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2">Sl No</th>
              <th className="border border-gray-400 p-2">Subject Code</th>
              <th className="border border-gray-400 p-2">Subject Name</th>
              <th className="border border-gray-400 p-2">Faculty Name</th>
              <th className="border border-gray-400 p-2">Present/Total</th>
              <th className="border border-gray-400 p-2">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((row, index) => (
              <tr key={index} className="text-center">
                <td className="border border-gray-400 p-2">{row.slNo}</td>
                <td className="border border-gray-400 p-2">{row.subjectCode}</td>
                <td className="border border-gray-400 p-2">{row.subjectName}</td>
                <td className="border border-gray-400 p-2">{row.facultyName}</td>
                <td className="border border-gray-400 p-2">{row.presentTotal}</td>
                <td className="border border-gray-400 p-2">{row.attendancePercentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
