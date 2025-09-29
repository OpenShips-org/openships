import { useEffect, useState } from "react";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";

import { useAuth } from "@/hooks/useAuth";
import { getUsername } from "@/services/authService";
import { logout } from "@/services/authService";
import useIsMobile from "@/hooks/isMobile";
import { motion, AnimatePresence } from "framer-motion";


const AccountPage = () => {
    const { user } = useAuth();
    const [username, setUsername] = useState<string | null>(null);
    const isMobile = useIsMobile();

    const [ Register, setRegister ] = useState(false);

    const formVariants = {
        initial: { y: 8, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { duration: 0.22 } },
        exit: { y: -8, opacity: 0, transition: { duration: 0.18 } },
    };

    useEffect(() => {
        let mounted = true;
        if (!user) {
            setUsername(null);
            return;
        }

        (async () => {
            try {
                // auth user object has a uid property; getUsername expects the uid string
                const name = await getUsername(user.uid);
                if (mounted) setUsername(name);
            } catch (err) {
                console.error("Failed to load username:", err);
                if (mounted) setUsername(null);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [user]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className={`bg-gray-400/40 h-150 ${isMobile ? "mt-0 mb-15" : "mt-30 mb-10"} w-240 border-2 border-gray-300 p-5 rounded-lg shadow-lg backdrop-blur-md`}>
                
                {user ? 
                
                <div className="mt-5 text-center">
                    Welcome, {username ?? user.email ?? "user"}

                    <button
                        onClick={async () => {
                            try {
                                await logout();
                            } catch (err) {
                                console.error("Logout failed:", err);
                            }
                        }}
                        className="mt-5 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Logout
                    </button>

                
                </div> : (
                    <>
                        <motion.div layout className="mt-5">
                            <AnimatePresence mode="wait">
                                {!Register ? (
                                    <motion.div
                                        key="login"
                                        variants={formVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className=""
                                    >
                                        <LoginForm />

                                        <button
                                            onClick={() => setRegister(true)}
                                            className="mt-3 w-full text-blue-500 hover:underline"
                                        >
                                            Don't have an account? Register here.
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="register"
                                        variants={formVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className=""
                                    >
                                        <RegisterForm />
                                        <button
                                            onClick={() => setRegister(false)}
                                            className="mt-3 w-full text-blue-500 hover:underline"
                                        >
                                            Already have an account? Login here.
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}

            </div>
        </div>
    );
};

export default AccountPage;