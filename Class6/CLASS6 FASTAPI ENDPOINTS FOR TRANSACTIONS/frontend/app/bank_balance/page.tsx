"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function BankBalance() {
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const user = searchParams.get("username");
    if (user) {
      setUsername(user);
      fetchBankBalance(user);
    } else {
      setError("Username not found. Please log in.");
      router.push("/"); // Redirect to login if no username
    }
  }, [searchParams, router]);

  const fetchBankBalance = async (user: string) => {
    try {
      const response = await fetch(`http://localhost:8000/bank_balance?username=${user}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch bank balance");
      }
      const data = await response.json();
      setBalance(data.balance);
      // In a real app, you'd fetch phone number separately if needed or return it from bank_balance
      // For now, hardcoding based on the user_db setup in main.py for display purposes
      if (user === "Ali") setPhoneNumber("9231");
      else if (user === "Ahsan") setPhoneNumber("4258");
      else if (user === "Shahid") setPhoneNumber("5018");

    } catch (err: any) {
      setError(err.message || "An unknown error occurred while fetching balance.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );
  }

  if (balance === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-lg">Loading balance...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome, {username}!</h1>
        <p className="text-lg mb-4">Current Balance: <span className="font-semibold">${balance.toFixed(2)}</span></p>
        {phoneNumber && <p className="text-lg mb-6">Phone Number: <span className="font-semibold">{phoneNumber}</span></p>}

        <div className="flex flex-col space-y-4">
          <Link href={`/deposit?username=${username}`}>
            <p className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center block">
              Deposit / Send Money
            </p>
          </Link>
          <Link href={`/withdrawal?username=${username}`}>
            <p className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-center block">
              Withdrawal
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
