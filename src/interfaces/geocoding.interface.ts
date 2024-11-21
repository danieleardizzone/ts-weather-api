// la nosta api di geolocalizzazione ci restituisce un oggetto con varie diciture che andremo a ricreare in questa interfaccia

export interface GeocodedLocation {
    country: string;
    lat: number;
    lon: number;
    name: string;
    state: string;
    local_names: { [key: string]: string };
}