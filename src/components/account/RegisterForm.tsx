import { useState } from "react";
import { register } from "@/services/authService";

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        // Basic client-side validation
        if (!email || !username || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }

    const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        try {
            setLoading(true);
            // register(email, password, username)
            await register(email, password, username);
            // Handle successful registration (e.g., redirect to login)
        } catch (err: any) {
            // err.message may include Firebase error codes like 'Registration failed: auth/invalid-email'
            const msg = err?.message ?? "Registration failed";
            // Show a friendlier message when possible
            if (msg.includes("auth/invalid-email")) {
                setError("Invalid email address");
            } else if (msg.includes("EMAIL_EXISTS") || msg.includes("auth/email-already-in-use")) {
                setError("An account with this email already exists");
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="backdrop-blur-sm p-3 rounded-lg shadow-lg max-w-md mx-auto mt-5 bg-white/30">
            <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-semibold" htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border border-gray-900 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-semibold" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border border-gray-900 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-semibold" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-900 rounded"
                        required
                        minLength={6}
                    />
                </div>
                <div>
                    <label className="block mb-1 font-semibold" htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2 border border-gray-900 rounded"
                        required
                        minLength={6}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition cursor-pointer duration-200 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Registering…" : "Register"}
                </button>
            </form>
        </div>
    );
}