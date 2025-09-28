import { Link } from "react-router-dom";
import useIsMobile from "@/hooks/isMobile";

import { FaMap, FaShip, FaRegImages, FaCog } from "react-icons/fa";
import { MdAccountCircle } from "react-icons/md";
import { LuShip } from "react-icons/lu";

function NavBar() {

    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <div className="fixed w-full h-14 bg-gray-500 bottom-0 p-2 flex justify-between items-center z-50">
                {/* Left: Settings */}
                <div className="relative flex-1 flex justify-start">
                    <Link
                        to="/settings"
                        aria-label="Settings"
                        className="absolute -top-15 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 border-4 border-gray-500 active:scale-95 cursor-pointer transition-transform duration-150 hover:bg-gray-100 active:bg-gray-300"
                    >
                        <FaCog className="text-gray-700 text-6xl p-2" />
                    </Link>
                </div>

                {/* Left middle: Account */}
                <div className="relative flex-1 flex justify-start">
                    <Link
                        to="/account"
                        aria-label="Account"
                        className="absolute -top-15 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 border-4 border-gray-500 active:scale-95 cursor-pointer transition-transform duration-150 hover:bg-gray-100 active:bg-gray-300"
                    >
                        <MdAccountCircle className="text-gray-700 text-6xl p-1" />
                    </Link>
                </div>

                {/* Center: Map */}
                <div className="relative flex-1 flex justify-center">
                    <Link
                        to="/"
                        aria-label="Map"
                        className="absolute -top-18 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-center w-20 h-20 border-4 border-gray-500 active:scale-95 cursor-pointer transition-transform duration-150 hover:bg-gray-100 active:bg-gray-300"
                    >
                        <FaMap className="text-5xl text-gray-700" />
                    </Link>
                </div>

                {/* Right middle: Vessels */}
                <div className="relative flex-1 flex justify-center">
                    <Link
                        to="/vessels"
                        aria-label="Vessel List"
                        className="absolute -top-15 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 border-4 border-gray-500 active:scale-95 cursor-pointer transition-transform duration-150 hover:bg-gray-100 active:bg-gray-300"
                    >
                        <FaShip className="text-gray-700 text-5xl p-1.5" />
                    </Link>
                </div>

                {/* Right: Gallery */}
                <div className="relative flex-1 flex justify-center">
                    <Link
                        to="/gallery"
                        aria-label="Gallery"
                        className="absolute -top-15 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 border-4 border-gray-500 active:scale-95 cursor-pointer transition-transform duration-150 hover:bg-gray-100 active:bg-gray-300"
                    >
                        <FaRegImages className="text-gray-700 text-5xl p-1.5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed w-full h-16 bg-gray-500 top-0 p-2 shadow-lg z-50"
        >
            <div className="max-w-7xl h-full flex justify-between items-center px-4">
                <Link
                    to="/"
                    className="text-gray-700 text-2xl font-bold flex items-center space-x-2"
                >
                    <LuShip
                        className="text-4xl text-gray-700 mr-2"
                    /> OpenShips
                </Link>
            </div>

            {/* Center Nav Items */}
            <div className="absolute left-1/2 top-5/6 -translate-x-1/2 -translate-y-1/2 flex space-x-16">         
                <Link
                    to="/gallery"
                    className="relative"
                    aria-label="Gallery"
                    tabIndex={0}
                >
                    <button
                        className="bg-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 border-4 border-gray-500 active:scale-95 hover:scale-105 cursor-pointer transition-transform duration-150 hover:bg-gray-100 active:bg-gray-300"
                        role="button"
                        tabIndex={0}
                        aria-label="Gallery"
                    >
                        <FaRegImages className="text-gray-700 text-5xl p-1.5" />
                    </button>
                </Link>

                <Link
                    to="/"
                    className="relative"
                    aria-label="Map"
                    tabIndex={0}
                >
                    <button 
                        className="bg-white rounded-full shadow-lg flex items-center justify-center w-20 h-20 border-4 border-gray-500 active:scale-95 hover:scale-105 cursor-pointer transition-transform duration-150 hover:bg-gray-100 active:bg-gray-300"
                        role="button"
                        tabIndex={0}
                        aria-label="Map"
                    >
                        <FaMap className="text-5xl text-gray-700" />
                    </button>
                </Link>

                <Link
                    to="/vessels"
                    className="relative"
                    aria-label="Vessel List"
                    tabIndex={0}
                >
                    <button
                        className="bg-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 border-4 border-gray-500 active:scale-95 hover:scale-105 cursor-pointer transition-transform duration-150 hover:bg-gray-100 active:bg-gray-300"
                        role="button"
                        tabIndex={0}
                        aria-label="Vessel List"
                    >
                        <FaShip className="text-gray-700 text-5xl p-1.5" />
                    </button>
                </Link>
            </div>

            {/* Right Nav Items */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-6">
                <Link
                    to="/account"
                    className="relative"
                    aria-label="Account"
                    tabIndex={0}
                >
                    <button
                        className="bg-white rounded-full shadow-lg flex items-center justify-center w-14 h-14 border-4 border-gray-500 active:scale-95 hover:scale-105 cursor-pointer transition-transform duration-150 hover:bg-gray-100 active:bg-gray-300"
                        role="button"
                        tabIndex={0}
                        aria-label="Account"
                    >
                        <MdAccountCircle className="text-gray-700 text-5xl p-1" />
                    </button>
                </Link>

                <Link
                    to="/settings"
                    className="relative"
                    aria-label="Settings"
                    tabIndex={0}
                >
                    <button
                        className="bg-white rounded-full shadow-lg flex items-center justify-center w-14 h-14 border-4 border-gray-500 active:scale-95 hover:scale-105 cursor-pointer transition-transform duration-150 hover:bg-gray-100 active:bg-gray-300"
                        role="button"
                        tabIndex={0}
                        aria-label="Settings"
                    >
                        <FaCog className="text-gray-700 text-5xl p-2" />
                    </button>
                </Link>
            </div>

        </div>
    );
}

export default NavBar;