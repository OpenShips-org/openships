import type { VesselPosition } from "@/types/VesselTypes";
import useIsMobile from "@/hooks/isMobile";

import {
  	Drawer,
 	DrawerClose,
 	DrawerContent,
  	DrawerHeader,
  	DrawerTitle,
} from "@/components/ui/drawer"

interface VesselSidebarProps {
	vessel: VesselPosition | null;
	isOpen: boolean;
	onClose: () => void;
}

const VesselSidebar = ({ vessel, isOpen, onClose }: VesselSidebarProps) => {
	
	if (useIsMobile()) {
        
        return (
            <Drawer 
        	    open={isOpen} 
        	    onOpenChange={(open) => { 
        	        // Nur reagieren wenn der Drawer durch Swipe geschlossen wird,
        	        // nicht wenn er durch externe State-Änderung (Map-Click) geschlossen wird
        	        if (!open && isOpen) {
        	            onClose();
        	        }
        	    }} 
        	    dismissible={true}
        	    modal={false}
        	>
                <DrawerContent className="w-full h-fit">
                    <DrawerHeader>
                        <DrawerTitle>Vessel Details</DrawerTitle>
                        <DrawerClose />
                    </DrawerHeader>
                    {vessel && (
                        <div className="p-4 space-y-3">
                            <div><strong>Name:</strong> {vessel.ShipName || 'Unknown'}</div>
                            <div><strong>MMSI:</strong> {vessel.MMSI}</div>
                            <div>
                                <strong>Speed:</strong>{' '}
                                {typeof vessel.SpeedOverGround === 'number' && Number.isFinite(vessel.SpeedOverGround) ? `${vessel.SpeedOverGround} knots` : 'Unknown'}
                            </div>
                            <div>
                                <strong>Course:</strong>{' '}
                                {typeof vessel.CourseOverGround === 'number' && Number.isFinite(vessel.CourseOverGround) ? `${vessel.CourseOverGround}°` : 'Unknown'}
                            </div>
                            <div>
                                <strong>Position:</strong>{' '}
                                {typeof vessel.Latitude === 'number' && typeof vessel.Longitude === 'number' ? `${vessel.Latitude.toFixed(4)}, ${vessel.Longitude.toFixed(4)}` : 'Unknown'}
                            </div>
                        </div>
                    )}
                </DrawerContent>
            </Drawer>
        );
    }
	
	return (
		<div className={`
			fixed top-16 left-0 h-full w-80 bg-black shadow-lg z-50 
			transform transition-transform duration-300 ease-in-out
			${isOpen && vessel ? 'translate-x-0' : '-translate-x-80'}
		`}>
			{vessel && (
				<>
					<div className="p-4 border-b">
						<div className="flex justify-between items-center">
							<h2 className="text-lg font-bold">Vessel Details</h2>
							<button 
								onClick={onClose}
								className="text-gray-500 hover:text-gray-700 transition-colors"
							>
								✕
							</button>
						</div>
					</div>
					
					<div className="p-4 space-y-3">
						<div><strong>Name:</strong> {vessel.ShipName || 'Unknown'}</div>
						<div><strong>MMSI:</strong> {vessel.MMSI}</div>
						<div>
							<strong>Speed:</strong>{' '}
							{typeof vessel.SpeedOverGround === 'number' && Number.isFinite(vessel.SpeedOverGround) ? `${vessel.SpeedOverGround} knots` : 'Unknown'}
						</div>
						<div>
							<strong>Course:</strong>{' '}
							{typeof vessel.CourseOverGround === 'number' && Number.isFinite(vessel.CourseOverGround) ? `${vessel.CourseOverGround}°` : 'Unknown'}
						</div>
						<div>
							<strong>Position:</strong>{' '}
							{typeof vessel.Latitude === 'number' && typeof vessel.Longitude === 'number' ? `${vessel.Latitude.toFixed(4)}, ${vessel.Longitude.toFixed(4)}` : 'Unknown'}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default VesselSidebar;