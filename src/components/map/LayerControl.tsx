import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaLayerGroup } from "react-icons/fa";
import type { LayerVisibility } from "@/hooks/useLayerVisibility";

const VESSEL_LAYER_CONFIG = [
  { key: "wigVessels" as const, label: "Wing in Ground Vessels" },
  { key: "fishingVessels" as const, label: "Fishing Vessels" },
  { key: "towingVessels" as const, label: "Towing Vessels" },
  { key: "militaryVessels" as const, label: "Military Vessels" },
  { key: "sailingVessels" as const, label: "Sailing Vessels" },
  { key: "pleasureCrafts" as const, label: "Pleasure Crafts" },
  { key: "highSpeedCrafts" as const, label: "High Speed Crafts" },
  { key: "tugs" as const, label: "Tugs" },
  { key: "lawEnforcement" as const, label: "Law Enforcement" },
  { key: "medicalTransport" as const, label: "Medical Transport" },
  { key: "passengerVessels" as const, label: "Passenger Vessels" },
  { key: "cargoVessels" as const, label: "Cargo Vessels" },
  { key: "tankerVessels" as const, label: "Tankers" },
  { key: "otherVessels" as const, label: "Other Vessels" },
];

interface LayerControlProps {
  layerVisibility: LayerVisibility;
  toggleLayer: (layerName: keyof LayerVisibility) => void;
  isMobile: boolean;
}

const LayerControl: React.FC<LayerControlProps> = ({
  layerVisibility,
  toggleLayer,
  isMobile,
}) => {
  return (
    <div
      className={`absolute ${isMobile ? "top-6 right-6" : "top-20 right-4"} z-50`}
    >
      <Popover>
        <PopoverTrigger asChild>
          <div className="bg-white/70 p-2.5 rounded-full cursor-pointer text-xl hover:bg-white/90 transition-colors dark:bg-gray-900 dark:text-white">
            <FaLayerGroup />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-55 mr-3 mt-1">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="layers">
              <AccordionTrigger className="cursor-pointer">
                Maps
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2 mt-2">
                  {/* OpenStreetMap Layer */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="osm-layer"
                      checked={layerVisibility.osm}
                      onCheckedChange={() => toggleLayer("osm")}
                      className="cursor-pointer"
                    />
                    <label
                      htmlFor="osm-layer"
                      className="text-sm cursor-pointer"
                    >
                      OpenStreetMap
                    </label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="buildings">
              <AccordionTrigger className="cursor-pointer">
                Buildings
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2 mt-2">
                  {/* Ports */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ports-layer"
                      checked={false}
                      onCheckedChange={() => {}}
                      className="cursor-pointer"
                    />
                    <label
                      htmlFor="ports-layer"
                      className="text-sm cursor-pointer"
                    >
                      Ports
                    </label>
                  </div>

                  {/* Lighthouses */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lighthouse-layer"
                      checked={layerVisibility.lighthouse}
                      onCheckedChange={() => toggleLayer("lighthouse")}
                      className="cursor-pointer"
                    />
                    <label
                      htmlFor="lighthouse-layer"
                      className="text-sm cursor-pointer"
                    >
                      Lighthouses
                    </label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="vessels">
              <AccordionTrigger className="cursor-pointer">
                Vessels
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2 mt-2">
                  {/* Vessel Names Toggle */}
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                      id="vessel-names-layer"
                      checked={layerVisibility.vesselNames}
                      onCheckedChange={() => toggleLayer("vesselNames")}
                      className="cursor-pointer"
                    />
                    <label
                      htmlFor="vessel-names-layer"
                      className="text-sm font-semibold cursor-pointer"
                    >
                      Show Vessel Names
                    </label>
                  </div>

                  <hr />

                  {VESSEL_LAYER_CONFIG.map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${key}-layer`}
                        checked={layerVisibility[key]}
                        onCheckedChange={() => toggleLayer(key)}
                        className="cursor-pointer"
                      />
                      <label
                        htmlFor={`${key}-layer`}
                        className="text-sm cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LayerControl;
