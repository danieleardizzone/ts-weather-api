# Weather Web App

__ts-weather-api__ is a web application that provides __real-time__ and __4 days forecast__ weather information for cities worldwide.

Built with Typescript, it fetches data from [Weather API](https://openweathermap.org/api) to display weather conditions.

## Technologies Employed

* Typescript
* HTML
* CSS
* [Weather API](https://openweathermap.org/api)

## Project Logic

Logic is based on this fundamentals:

1. __User Input__: user search a city worldwide.
2. __Data Fetch__: data fetch from [Weather API](https://openweathermap.org/api) using:
    * [Geocoding API](https://openweathermap.org/api/geocoding-api) to retrieve city data (latitude and longitude) for fetching data to other APIs.
    * [Current Weather Data API](https://openweathermap.org/current) to get current weather of the selected city.
    * [5 Day Weather Forecast](https://openweathermap.org/forecast5) to get 3-hourly 4 days forecast weather of the selected city.
3. __Data Visualization__: data fetched from API are displayed and re-organized.

## Project Characteristics

* __Real-Time Weather Data__
* __Forecast Weather Data__
* __User-Friendly Interface__
* __Responsive Design__

## Screenshot

`Ctrl + click`

[![Video Thumbnail](https://img.youtube.com/vi/pubP8Y6rhPw/0.jpg)](https://youtu.be/pubP8Y6rhPw)

## Link

`Ctrl + click`

https://danieleardizzone.github.io/ts-weather-api/

### Credits

[Imparare Coding con Manuel](https://www.youtube.com/@codingconmanuel)

[Weather API](https://openweathermap.org/api)
