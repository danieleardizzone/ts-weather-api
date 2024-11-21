(function () {
    'use strict';

    class Weather {
        static instance;
        weatherEndpoint = "https://api.openweathermap.org/data/2.5/weather"; //ci permette di visualizzare i current weather data
        geocodingEndpoint = "https://api.openweathermap.org/geo/1.0/direct"; //ci servira per estrarre l'altitudine e longitudine data la citta
        forecastEndpoint = "https://api.openweathermap.org/data/2.5/forecast"; //ci permette di visualizzare i dati del meteo di 5 giorni per ogni citta con un 3-hours step
        setting = { units: "metric", lang: "it" };
        apiKey = "ec3cfc639ecbd13d5aa52ff0fbe4f305";
        constructor() { }
        static getInstance() {
            if (!Weather.instance) {
                Weather.instance = new Weather();
            }
            return Weather.instance;
        }
        // questo metodo ci permette di ottenere le informazioni delle nostre localita e di metterci in ascolto delle localita cvhe l'utente digita sul form
        async getLocations(query) {
            const responde = await fetch(`${this.geocodingEndpoint}?q=${query}&limit=5&appid=${this.apiKey}&lang=${this.setting.lang}`);
            const data = await responde.json();
            return data;
        }
        async getCurrentWeather(lat, lon) {
            const response = await fetch(`${this.weatherEndpoint}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.setting.units}&lang=${this.setting.lang}`);
            const data = await response.json();
            return data;
        }
        async getForecast(lat, lon) {
            const response = await fetch(`${this.forecastEndpoint}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&cnt=32&units=${this.setting.units}&lang=${this.setting.lang}`);
            const data = await response.json();
            return data;
        }
    }

    // recuperiamo dal dom il nostro form con classe 'city-search'
    const citySearchForm = document.querySelector('.city-search');
    if (citySearchForm) {
        const cityInput = citySearchForm.querySelector('.city');
        const searchResults = citySearchForm.querySelector('.search-results');
        const pageHeader = document.querySelector('header');
        citySearchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
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
            locations.forEach((location) => {
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
            });
            if (!searchResults.classList.contains('transition')) {
                searchResults.classList.add('transition');
            }
        });
        if (cityInput) {
            cityInput.addEventListener('click', () => {
                if (cityInput.value !== '') {
                    citySearchForm.dispatchEvent(new Event('submit', { cancelable: true }));
                }
            });
        }
        document.addEventListener('click', (close) => {
            if (close.target !== searchResults && close.target !== cityInput) {
                searchResults.innerHTML = '';
                if (searchResults.classList.contains('transition')) {
                    searchResults.classList.remove('transition');
                }
            }
        });
    }
    let currentDayIndex = 0;
    const previousDaySelector = document.getElementById('previous-day');
    const nextDaySelector = document.getElementById('next-day');
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
    const weatherDaily = document.querySelector('.weather-daily ul');
    let daysArrs;
    function showWeatherData(currentWeather, forecast) {
        const weatherStats = document.querySelector('.weather-stats');
        const weatherMain = document.querySelector('.weather-main');
        const weatherLocation = document.querySelector('.weather-location');
        const weatherTemperature = document.querySelector('.weather-temperature');
        weatherStats.className = 'weather-stats';
        weatherStats.classList.add(currentWeather.weather[0].main.toLowerCase());
        weatherMain.textContent = currentWeather.weather[0].description;
        weatherLocation.textContent = currentWeather.name;
        weatherTemperature.textContent = `${currentWeather.main.temp.toFixed(1)}°C`;
        daysArrs = getWeatherDays(forecast);
        if (daysArrs[0].length === 0) {
            currentDayIndex = 1;
        }
        else {
            currentDayIndex = 0;
        }
        updateWeatherDisplay(currentDayIndex, daysArrs, weatherDaily);
        const weatherCardSection = document.querySelector('section.weather-card');
        if (weatherCardSection) {
            weatherCardSection.classList.remove('visibility-hidden');
            if (!weatherCardSection.classList.contains('transition')) {
                weatherCardSection.classList.add('transition');
            }
        }
    }
    function getWeatherDays(forecast) {
        const currentDate = new Date();
        const currentWeekDay = currentDate.getDay();
        const days = [[], [], [], []];
        forecast.list.forEach((forecastWeather) => {
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
    function displayWeatherForDay(dayIndex, daysArrs, weatherDaily) {
        weatherDaily.innerHTML = '';
        // if (dayIndex < 0 || dayIndex >= daysArrs.length || !daysArrs[dayIndex] || daysArrs[dayIndex].length === 0) {
        //     console.warn(`Nessun dato disponibile per il giorno con indice ${dayIndex}.`);
        //     return;
        // }
        const dayData = daysArrs[dayIndex];
        dayData.forEach((forecastData) => {
            const li = document.createElement('li');
            li.innerHTML = `
        <span class="stats">
            <span class="temperature">${forecastData.forecastTemperature.toFixed(1)}°C</span>
            <span class="main">${forecastData.forecastMain}</span>
        </span>
        <span class="time">${forecastData.forecastTimeInterval}</span>
        `;
            weatherDaily.appendChild(li);
        });
    }
    function updateWeatherDisplay(dayIndex, daysArrs, weatherDaily) {
        displayWeatherForDay(dayIndex, daysArrs, weatherDaily);
        changeForecastDay(daysArrs);
        updateForecastDate(dayIndex, daysArrs);
    }
    function changeForecastDay(daysArrs) {
        if (currentDayIndex === 0 || daysArrs[0].length === 0 && currentDayIndex === 1) {
            previousDaySelector.classList.add('visibility-hidden');
        }
        else {
            previousDaySelector.classList.remove('visibility-hidden');
        }
        if (currentDayIndex === daysArrs.length - 1) {
            nextDaySelector.classList.add('visibility-hidden');
        }
        else {
            nextDaySelector.classList.remove('visibility-hidden');
        }
    }
    function updateForecastDate(dayIndex, daysArrs) {
        const actualWeekDay = document.querySelector('.day_week-day');
        const actualDate = document.querySelector('.day_date');
        const previousWeekDay = document.querySelector('.previous-day_week-day');
        const previousDate = document.querySelector('.previous-day_date');
        const nextWeekDay = document.querySelector('.next-day_week-day');
        const nextDate = document.querySelector('.next-day_date');
        const actualDayArrElement = daysArrs[dayIndex][0];
        actualDate.innerHTML = actualDayArrElement.forecastDate;
        if (actualDayArrElement.forecastWeekDay === actualDayArrElement.currentWeekDay) {
            actualWeekDay.innerHTML = 'Oggi';
            if (dayIndex < daysArrs.length - 1) {
                const nextDayArrElement = daysArrs[dayIndex + 1][0];
                nextDate.innerHTML = nextDayArrElement.forecastDate;
                nextWeekDay.innerHTML = 'Domani';
            }
        }
        else if (actualDayArrElement.forecastWeekDay === actualDayArrElement.currentWeekDay + 1) {
            actualWeekDay.innerHTML = 'Domani';
            if (dayIndex > 0) {
                const previousDayArrElement = daysArrs[dayIndex - 1][0];
                previousDate.innerHTML = previousDayArrElement.forecastDate;
                previousWeekDay.innerHTML = 'Oggi';
            }
            if (dayIndex < daysArrs.length - 1) {
                const nextDayArrElement = daysArrs[dayIndex + 1][0];
                nextDate.innerHTML = nextDayArrElement.forecastDate;
                nextWeekDay.innerHTML = nextDayArrElement.forecastWeekDayLong;
            }
        }
        else {
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

})();
//# sourceMappingURL=main.js.map
