export function GetIcon(data: any) {
    const iconMapping = {
        url: '',
        width: 0,
        height: 0,
        mask: true
    };
    
    switch (data.NavigationStatus) {
        case 0: // Underway using engine
            return {
                ...iconMapping,
                url: '/Ship-Icon.png',
                height: 512,
                width: 360,
            };
        case 1: // At anchor
            return {   
                ...iconMapping,
                url: '/Ship-Anchored.png',
                height: 512,
                width: 512
            };
        default:
            return {
                ...iconMapping,
                url: '/Ship-Icon.png',
                height: 512,
                width: 360,
            };
    } 
}

export function GetAngle(data: any) {
    if (data.NavigationStatus === 1) return 0; // No rotation for anchored vessels
    return data.TrueHeading === 511 ? 0 : 360 - (data.TrueHeading || 0);
}

export function GetSize(data: any) {
    const iconSize = 40; // Default icon size
    if (data.NavigationStatus === 1) {
        return iconSize * 0.75; // Smaller size for anchored vessels
    }
    return iconSize;
}