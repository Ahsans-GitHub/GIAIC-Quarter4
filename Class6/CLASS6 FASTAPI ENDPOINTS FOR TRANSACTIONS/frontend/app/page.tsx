"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [createAccountError, setCreateAccountError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`http://localhost:8000/authenticate?username=${username}&pin=${pin}`);
      console.log(`Authenticating with: http://localhost:8000/authenticate?username=${username}&pin=${pin}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Authentication failed");
      }
      const data = await response.json();
      console.log(data.message);
      // Redirect to bank_balance page after successful login
      router.push(`/bank_balance?username=${username}`);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during authentication.");
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateAccountError("");

    try {
      const response = await fetch("http://localhost:8000/create_account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: newUsername, pin: newPin, phone_number: newPhoneNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Account creation failed");
      }

      const data = await response.json();
      console.log(data.message);
      alert(data.message); // Show success message
      // Optionally, switch to login form and pre-fill username
      setIsCreatingAccount(false);
      setUsername(newUsername);
      setPin("");
      setNewUsername("");
      setNewPin("");
      setNewPhoneNumber("");
    } catch (err: any) {
      setCreateAccountError(err.message || "An unknown error occurred during account creation.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isCreatingAccount ? "Create New Bank Account" : "Login to your Bank Account"}
        </h1>
        {isCreatingAccount ? (
          <form onSubmit={handleCreateAccount}>
            <div className="mb-4">
              <label htmlFor="newUsername" className="block text-gray-700 text-sm font-bold mb-2">
                Username:
              </label>
              <input
                type="text"
                id="newUsername"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 relative">
              <label htmlFor="newPin" className="block text-gray-700 text-sm font-bold mb-2">
                PIN:
              </label>
              <input
                type={showPin ? "text" : "password"}
                id="newPin"
                className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                required
              />
               <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 top-7 flex items-center px-2 text-gray-600 transition-all duration-300 hover:text-gray-800"
              >
                {showPin ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.981 18.232A10.9 10.9 0 0 0 12 21.75c3.638 0 7.044-1.192 9.471-3.272M21.75 12v3.75m-4.5-9-4.5 4.5M3.75 12l-.625-2.671C2.476 7.456 1.75 4.968 1.75 2.5a.75.75 0 0 1 1.5 0c0 1.996.79 3.553 1.875 4.75m.75-4.5L12 10.5m-4.5-4.5L10.5 12M12 4.5c-1.895 0-3.791.711-5.118 1.988M2.25 12a10.9 10.9 0 0 1 1.981-5.732m.677-2.909c.772.394 1.547.697 2.327.909M12 19.5a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75Z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mb-6">
              <label htmlFor="newPhoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
                Phone Number:
              </label>
              <input
                type="text"
                id="newPhoneNumber"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                required
              />
            </div>
            {createAccountError && <p className="text-red-500 text-xs italic mb-4">{createAccountError}</p>}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingAccount(false)}
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                Username:
              </label>
              <input
                type="text"
                id="username"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-6 relative">
              <label htmlFor="pin" className="block text-gray-700 text-sm font-bold mb-2">
                PIN:
              </label>
              <input
                type={showPin ? "text" : "password"}
                id="pin"
                className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 top-7 flex items-center px-2 text-gray-600 transition-all duration-300 hover:text-gray-800"
              >
                {showPin ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.981 18.232A10.9 10.9 0 0 0 12 21.75c3.638 0 7.044-1.192 9.471-3.272M21.75 12v3.75m-4.5-9-4.5 4.5M3.75 12l-.625-2.671C2.476 7.456 1.75 4.968 1.75 2.5a.75.75 0 0 1 1.5 0c0 1.996.79 3.553 1.875 4.75m.75-4.5L12 10.5m-4.5-4.5L10.5 12M12 4.5c-1.895 0-3.791.711-5.118 1.988M2.25 12a10.9 10.9 0 0 1 1.981-5.732m.677-2.909c.772.394 1.547.697 2.327.909M12 19.5a.75.75 0 0 0 .75-.75.75.75 0 0 0-.75-.75.75.75 0 0 0-.75.75.75.75 0 0 0 .75.75Z" />
                  </svg>
                )}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingAccount(true)}
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              >
                Create Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
