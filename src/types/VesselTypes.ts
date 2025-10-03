type VesselPosition = {
    MMSI: number;
    ShipName: string;
    Timestamp: string;
    Latitude: number;
    Longitude: number;
    NavigationalStatus: number;
    RateOfTurn: number;
    SpeedOverGround: number;
    CourseOverGround: number;
    TrueHeading: number;
    VesselType: number;
}

export type { VesselPosition };