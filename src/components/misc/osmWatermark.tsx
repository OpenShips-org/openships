export default function OsmWatermark({ isMobile }: { isMobile: boolean }) {
    return (
        <div className={`absolute ${isMobile ? "top-4 left-4" : "bottom-4 left-4"} z-50 text-xs bg-white/70 px-2 py-1 rounded-md dark:bg-gray-900 dark:text-white`}>
            Map data © <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> contributors
        </div>
    );
}