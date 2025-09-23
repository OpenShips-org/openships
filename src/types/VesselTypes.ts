type VesselPosition = {
    MMSI: number;
    ShipName: string;
    Timestamp: string;
    Latitude: number;
    Longitude: number;
    NavigationalStatus: {
        ID: number;
        String: string;
    };
    RateOfTurn: number;
    SpeedOverGround: number;
    CourseOverGround: number;
    TrueHeading: number;
    VesselType: {
        ID: number;
        String: string;
    };
}

export type { VesselPosition };