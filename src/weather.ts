import { CurrentWeather } from './interfaces/currentWeather.interface';
import { Forecast } from './interfaces/forecast.interface';
import { GeocodedLocation } from './interfaces/geocoding.interface';

export class Weather {

    private static instance: Weather;

    private weatherEndpoint: string = "https://api.openweathermap.org/data/2.5/weather"; //ci permette di visualizzare i current weather data
    private geocodingEndpoint: string = "https://api.openweathermap.org/geo/1.0/direct"; //ci servira per estrarre l'altitudine e longitudine data la citta
    private forecastEndpoint: string = "https://api.openweathermap.org/data/2.5/forecast"; //ci permette di visualizzare i dati del meteo di 5 giorni per ogni citta con un 3-hours step

    private setting: { [key: string]: string } = { units: "metric", lang: "it" };

    private apiKey: string = "ec3cfc639ecbd13d5aa52ff0fbe4f305";

    constructor() { }

    static getInstance() {
        if (!Weather.instance) {
            Weather.instance = new Weather();
        }

        return Weather.instance;
    }

    // questo metodo ci permette di ottenere le informazioni delle nostre localita e di metterci in ascolto delle localita cvhe l'utente digita sul form

    async getLocations(query: string): Promise<GeocodedLocation[]> {
        const responde = await fetch(`${this.geocodingEndpoint}?q=${query}&limit=5&appid=${this.apiKey}&lang=${this.setting.lang}`);

        const data: GeocodedLocation[] = await responde.json();

        return data;
    }

    async getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {

        const response = await fetch(`${this.weatherEndpoint}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.setting.units}&lang=${this.setting.lang}`);

        const data: CurrentWeather = await response.json();

        return data;

    }

    async getForecast(lat: number, lon: number): Promise<Forecast> {
        const response = await fetch(`${this.forecastEndpoint}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&cnt=32&units=${this.setting.units}&lang=${this.setting.lang}`);

        const data: Forecast = await response.json();

        return data;
    }
}