import { CurrentWeather } from './interfaces/currentWeather.interface';
import { ForecastSelectedData } from './interfaces/forecastSelectedData.interface';
import { Forecast, ForecastWeather } from './interfaces/forecast.interface';
import { Weather } from './weather';

// recuperiamo dal dom il nostro form con classe 'city-search'
const citySearchForm = document.querySelector('.city-search') as HTMLFormElement;

if (citySearchForm) {

    const cityInput = citySearchForm.querySelector('.city') as HTMLInputElement;
    const searchResults = citySearchForm.querySelector('.search-results') as HTMLUListElement;

    const pageHeader = document.querySelector('header') as HTMLElement;

    citySearchForm.addEventListener('submit', async (e: SubmitEvent) => {
        e.preventDefault();

        cityInput.blur();

        if (!searchResults.classList.contains('transition')) {
            searchResults.classList.add('transition');
        }

        const city = cityInput.value;
        const weather = Weather.getInstance();
        const locations = await weather.getLocations(city);

        searchResults.innerHTML = '';

        if (!locations.length) {
            const li = document.createElement('li');
            li.textContent = "Nessun risultato trovato";
            searchResults.appendChild(li);
            return;
        }

        locations.forEach((location: any) => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = `${location.name}, ${location.state}, ${location.country}`;

            button.addEventListener('click', async () => {
                searchResults.innerHTML = '';
                Promise.all([
                    weather.getCurrentWeather(location.lat, location.lon),
                    weather.getForecast(location.lat, location.lon),
                ]).then(([currentWeather, forecast]) => {
                    showWeatherData(currentWeather, forecast);
                });
                if (!pageHeader.classList.contains('transition')) {
                    pageHeader.classList.add('transition');
                }

            });
            li.appendChild(button);
            searchResults.appendChild(li);
        })
        if (!searchResults.classList.contains('transition')) {
            searchResults.classList.add('transition');
        }
    });

    document.addEventListener('click', (close) => {
        if (close.target !== searchResults && close.target !== cityInput) {
            searchResults.innerHTML = '';
            if (searchResults.classList.contains('transition')) {
                searchResults.classList.remove('transition')
            }
        }
    });
}

let currentDayIndex = 0;

const previousDaySelector = document.getElementById('previous-day') as HTMLButtonElement;
const nextDaySelector = document.getElementById('next-day') as HTMLButtonElement;

previousDaySelector.addEventListener('click', () => {
    if (currentDayIndex > 0) {
        currentDayIndex--;
        updateWeatherDisplay(currentDayIndex, daysArrs, weatherDaily);
    }
});

nextDaySelector.addEventListener('click', () => {
    if (currentDayIndex < daysArrs.length - 1) {
        currentDayIndex++;
        updateWeatherDisplay(currentDayIndex, daysArrs, weatherDaily);
    }
});

const weatherDaily = document.querySelector('.weather-daily ul') as HTMLUListElement;
let daysArrs: ForecastSelectedData[][];



function showWeatherData(currentWeather: CurrentWeather, forecast: Forecast) {

    const weatherStats = document.querySelector('.weather-stats') as HTMLElement;
    const weatherMain = document.querySelector('.weather-main') as HTMLParagraphElement;
    const weatherLocation = document.querySelector('.weather-location') as HTMLParagraphElement;
    const weatherTemperature = document.querySelector('.weather-temperature') as HTMLParagraphElement;

    weatherStats.className = 'weather-stats';
    weatherStats.classList.add(currentWeather.weather[0].main.toLowerCase());
    weatherMain.textContent = currentWeather.weather[0].description;
    weatherLocation.textContent = currentWeather.name;
    weatherTemperature.textContent = `${currentWeather.main.temp.toFixed(1)}°C`;

    daysArrs = getWeatherDays(forecast);

    if (daysArrs[0].length === 0) {
        currentDayIndex = 1;
    } else {
        currentDayIndex = 0;
    };

    updateWeatherDisplay(currentDayIndex, daysArrs, weatherDaily);

    const weatherCardSection = document.querySelector('section.weather-card') as HTMLElement;
    if (weatherCardSection) {
        weatherCardSection.classList.remove('visibility-hidden');
        if (!weatherCardSection.classList.contains('transition')) {
            weatherCardSection.classList.add('transition')
        }
    }

}


function getWeatherDays(forecast: Forecast) {

    const currentDate = new Date();
    const currentWeekDay = currentDate.getDay();

    const days: ForecastSelectedData[][] = [[], [], [], []];

    forecast.list.forEach((forecastWeather: ForecastWeather) => {

        const forecastTemperature = forecastWeather.main.temp;
        const forecastMain = forecastWeather.weather[0].description;
        const forecastDateTime = new Date(forecastWeather.dt * 1000);
        const forecastWeekDay = forecastDateTime.getDay();
        const forecastWeekDayLong = forecastDateTime.toLocaleDateString('it-IT', { weekday: 'long' });
        const forecastDate = forecastDateTime.toLocaleDateString('it-IT', { year: 'numeric', month: 'numeric', day: 'numeric' });

        const forecastTime = forecastDateTime.toLocaleTimeString('it-IT', { hour: '2-digit' });
        const forecastDateTimePlus3Hours = new Date(forecastDateTime);
        forecastDateTimePlus3Hours.setHours(forecastDateTimePlus3Hours.getHours() + 3);
        const forecastTimePlus3Hours = forecastDateTimePlus3Hours.toLocaleTimeString('it-IT', { hour: '2-digit' });

        const forecastTimeInterval = forecastTime + ' - ' + forecastTimePlus3Hours;

        const dayDifference = (forecastWeekDay - currentWeekDay + 7) % 7;

        if (dayDifference >= 0 && dayDifference < 4) {

            const selectedData = {
                forecastTemperature,
                forecastMain,
                forecastWeekDayLong,
                forecastTimeInterval,
                forecastDate,
                forecastWeekDay,
                currentWeekDay,
            };

            days[dayDifference].push(selectedData);
        }

    });

    return days;

}

function displayWeatherForDay(dayIndex: number, daysArrs: ForecastSelectedData[][], weatherDaily: HTMLElement) {

    weatherDaily.innerHTML = '';

    const dayData = daysArrs[dayIndex];

    dayData.forEach((forecastData: ForecastSelectedData) => {
        const li = document.createElement('li');
        li.innerHTML = `
        <span class="stats">
            <span class="temperature">${forecastData.forecastTemperature.toFixed(1)}°C</span>
            <span class="main">${forecastData.forecastMain}</span>
        </span>
        <span class="time">${forecastData.forecastTimeInterval}</span>
        `;
        weatherDaily.appendChild(li);
    })

}

function updateWeatherDisplay(dayIndex: number, daysArrs: ForecastSelectedData[][], weatherDaily: HTMLElement) {
    displayWeatherForDay(dayIndex, daysArrs, weatherDaily)
    changeForecastDay(daysArrs);
    updateForecastDate(dayIndex, daysArrs);
}

function changeForecastDay(daysArrs: ForecastSelectedData[][]) {

    if (currentDayIndex === 0 || daysArrs[0].length === 0 && currentDayIndex === 1) {
        previousDaySelector.classList.add('visibility-hidden');
    } else {
        previousDaySelector.classList.remove('visibility-hidden');
    };

    if (currentDayIndex === daysArrs.length - 1) {
        nextDaySelector.classList.add('visibility-hidden');
    } else {
        nextDaySelector.classList.remove('visibility-hidden');
    };
}

function updateForecastDate(dayIndex: number, daysArrs: ForecastSelectedData[][]) {

    const actualWeekDay = document.querySelector('.day_week-day') as HTMLSpanElement;
    const actualDate = document.querySelector('.day_date') as HTMLSpanElement;
    const previousWeekDay = document.querySelector('.previous-day_week-day') as HTMLSpanElement;
    const previousDate = document.querySelector('.previous-day_date') as HTMLSpanElement;
    const nextWeekDay = document.querySelector('.next-day_week-day') as HTMLSpanElement;
    const nextDate = document.querySelector('.next-day_date') as HTMLSpanElement;

    const actualDayArrElement = daysArrs[dayIndex][0];
    actualDate.innerHTML = actualDayArrElement.forecastDate;


    if (actualDayArrElement.forecastWeekDay === actualDayArrElement.currentWeekDay) {
        actualWeekDay.innerHTML = 'Oggi';
        if (dayIndex < daysArrs.length - 1) {
            const nextDayArrElement = daysArrs[dayIndex + 1][0];
            nextDate.innerHTML = nextDayArrElement.forecastDate;

            nextWeekDay.innerHTML = 'Domani';
        }
    } else if (actualDayArrElement.forecastWeekDay === actualDayArrElement.currentWeekDay + 1) {
        actualWeekDay.innerHTML = 'Domani';
        if (dayIndex > 0 && daysArrs[0].length !== 0) {
            const previousDayArrElement = daysArrs[dayIndex - 1][0];
            previousDate.innerHTML = previousDayArrElement.forecastDate;

            previousWeekDay.innerHTML = 'Oggi';
        }
        if (dayIndex < daysArrs.length - 1) {
            const nextDayArrElement = daysArrs[dayIndex + 1][0];
            nextDate.innerHTML = nextDayArrElement.forecastDate;

            nextWeekDay.innerHTML = nextDayArrElement.forecastWeekDayLong;
        }
    } else {
        actualWeekDay.innerHTML = actualDayArrElement.forecastWeekDayLong;
        if (dayIndex > 0) {
            const previousDayArrElement = daysArrs[dayIndex - 1][0];
            previousDate.innerHTML = previousDayArrElement.forecastDate;

            previousWeekDay.innerHTML = previousDayArrElement.forecastWeekDayLong;
        }

        if (dayIndex < daysArrs.length - 1) {
            const nextDayArrElement = daysArrs[dayIndex + 1][0];
            nextDate.innerHTML = nextDayArrElement.forecastDate;

            nextWeekDay.innerHTML = nextDayArrElement.forecastWeekDayLong;
        }

    }



}
