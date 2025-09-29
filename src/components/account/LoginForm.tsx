import { useState } from "react";
import { login } from "@/services/authService";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        // Basic client-side validation
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }
        try {
            setLoading(true);
            await login(email, password);
            // Handle successful login (e.g., redirect to dashboard)
        } catch (err: any) {
            const msg = err?.message ?? "Login failed";
            if (msg.includes("auth/invalid-email")) {
                setError("Invalid email address");
            } else if (msg.includes("auth/user-not-found") || msg.includes("auth/wrong-password")) {
                setError("Incorrect email or password");
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="backdrop-blur-sm p-3 rounded-lg shadow-lg max-w-md mx-auto mt-5 bg-white/30">
            <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-1 font-semibold" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border border-gray-900 rounded"
                        required
                        disabled={loading}
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-semibold" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-900 rounded"
                        required
                        disabled={loading}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition cursor-pointer duration-200 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}