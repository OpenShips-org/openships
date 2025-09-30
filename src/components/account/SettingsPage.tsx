import React, { useEffect, useCallback } from 'react';

import { Switch } from '../ui/switch';

import useIsMobile from '@/hooks/isMobile';
import { useTheme } from '@/context/ThemeContext';
import { Handshake } from 'lucide-react';

const SettingsPage = () => {

    const { theme, setTheme } = useTheme();

    const isMobile = useIsMobile();

    // prevent vertical scrolling while this component is mounted
    useEffect(() => {
        if (typeof document === "undefined") return;
        const previous = document.body.style.overflowY;
        document.body.style.overflowY = "hidden";
        return () => {
            document.body.style.overflowY = previous || "";
        };
    }, []);

    const handleThemeChange = useCallback((checked: boolean) => {
        setTheme(checked ? "dark" : "light");
    }, [setTheme]);

    return (
        <div className={`flex justify-center items-top min-h-screen ${isMobile ? "mt-15" : "mt-5"}`}>
            <div className={`bg-gray-400/40 dark:bg-gray-900 h-fit min-h-190 ${isMobile ? "mt-0 mb-15 mr-8 ml-8" : "mt-30 mb-10"} w-240 border-2 border-gray-300 p-5 rounded-lg shadow-lg backdrop-blur-md`}>
                <div className="mt-5 text-center">
                    <h1 className='font-bold text-3xl text-gray-700 dark:text-white'>Settings</h1>

                    <div className="mt-10 flex flex-col gap-10 ">
                        {/* Gruppe zentrieren und innerhalb eine konstante max-width verwenden */}
                        <div className="flex justify-center w-full">
                            <div className="flex items-center justify-between w-full max-w-[320px] px-4">

                                <form className='flex items-center justify-between w-full'>
                                    {/* truncate oder feste Breite sorgt für einheitlichen Abstand bei langen Texten */}
                                    <span className='font-medium text-lg text-gray-700 dark:text-white truncate'>Dark Mode</span>
                                    <div className="ml-4">
                                        <Switch
                                            checked={theme === 'dark'}
                                            onCheckedChange={handleThemeChange}
                                            aria-label='Toggle dark mode'
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SettingsPage;