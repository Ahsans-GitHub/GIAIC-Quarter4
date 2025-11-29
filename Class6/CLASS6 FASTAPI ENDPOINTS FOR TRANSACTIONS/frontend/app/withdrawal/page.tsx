"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Withdrawal() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const user = searchParams.get("username");
    if (user) {
      setUsername(user);
    } else {
      setError("Username not found. Please log in.");
      router.push("/");
    }
  }, [searchParams, router]);

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("http://localhost:8000/withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          pin: pin,
          amount: parseFloat(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Withdrawal failed");
      }

      setMessage(data.message);
      // Redirect to bank_balance after a short delay to show success message
      setTimeout(() => {
        router.push(`/bank_balance?username=${username}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during withdrawal.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Withdrawal</h1>
        <form onSubmit={handleWithdrawal}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200"
              value={username}
              disabled
            />
          </div>
          <div className="mb-4">
            <label htmlFor="pin" className="block text-gray-700 text-sm font-bold mb-2">
              Your PIN:
            </label>
            <input
              type="password"
              id="pin"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
              Amount:
            </label>
            <input
              type="number"
              id="amount"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          {message && <p className="text-green-500 text-xs italic mb-4">{message}</p>}
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Withdraw
            </button>
            <Link href={`/bank_balance?username=${username}`}>
              <p className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                Cancel
              </p>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
