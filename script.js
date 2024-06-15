import { fetchCurrentWeather, fetchWeatherForecast, fetchHourlyForecast } from './weatherService.js';

const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const geolocationBtn = document.getElementById('geolocation-btn');
const unitToggle = document.getElementById('unit-toggle');
const weatherInfo = document.getElementById('weather-info');
const forecastInfo = document.getElementById('forecast-info');
const hourlyInfo = document.getElementById('hourly-info');

searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location) {
        getWeatherData(location);
    } else {
        alert('Please enter a location.');
    }
});

geolocationBtn.addEventListener('click', () => {
    getGeolocationWeather();
});

async function getWeatherData(location) {
    try {
        showLoading();
        const [currentWeather, forecast] = await Promise.all([
            fetchCurrentWeather(location, unitToggle.value),
            fetchWeatherForecast(location, unitToggle.value)
        ]);
        hideLoading();
        displayCurrentWeather(currentWeather);
        displayWeatherForecast(forecast);
    } catch (error) {
        hideLoading();
        console.error('Error fetching weather data:', error);
        alert('Could not fetch weather data. Please try again later.');
    }
}

async function getGeolocationWeather() {
    try {
        showLoading();
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        const location = await getLocationName(latitude, longitude);
        const [currentWeather, forecast] = await Promise.all([
            fetchCurrentWeather(`${latitude},${longitude}`, unitToggle.value),
            fetchWeatherForecast(`${latitude},${longitude}`, unitToggle.value)
        ]);
        hideLoading();
        locationInput.value = location;
        displayCurrentWeather(currentWeather);
        displayWeatherForecast(forecast);
    } catch (error) {
        hideLoading();
        console.error('Error getting geolocation weather:', error);
        alert('Could not fetch weather for your location. Please enter manually.');
    }
}

function displayCurrentWeather(weather) {
    const unitLabel = unitToggle.value === 'metric' ? '°C' : '°F';
    weatherInfo.innerHTML = `
        <div class="card">
            <h3>${weather.location}</h3>
            <p>Temperature: ${weather.temperature}${unitLabel}</p>
            <p>Condition: ${weather.condition}</p>
            <p>Humidity: ${weather.humidity}%</p>
            <p>Wind Speed: ${weather.windSpeed} km/h</p>
            <p>Sunrise: ${weather.sunrise}</p>
            <p>Sunset: ${weather.sunset}</p>
        </div>
    `;
}

function displayWeatherForecast(forecast) {
    const unitLabel = unitToggle.value === 'metric' ? '°C' : '°F';
    const threeDayForecast = forecast.slice(0, 3);
    forecastInfo.innerHTML = threeDayForecast.map(day => `
        <div class="card" onclick="getHourlyForecast('${day.date}')">
            <h3>${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
            <img src="https://weather.visualcrossing.com/static/img/icons/${day.icon}.png" alt="${day.condition}">
            <p>Max Temp: ${day.maxTemp}${unitLabel}</p>
            <p>Min Temp: ${day.minTemp}${unitLabel}</p>
            <p>Condition: ${day.condition}</p>
        </div>
    `).join('');
}

window.getHourlyForecast = async function (date) {
    try {
        showLoadingHourly();
        const hourlyForecast = await fetchHourlyForecast(date);
        hideLoadingHourly();
        displayHourlyForecast(hourlyForecast);
    } catch (error) {
        hideLoadingHourly();
        console.error('Error fetching hourly forecast:', error);
        alert('Could not fetch hourly forecast. Please try again later.');
    }
}

function displayHourlyForecast(hourlyForecast) {
    const unitLabel = unitToggle.value === 'metric' ? '°C' : '°F';
    hourlyInfo.innerHTML = hourlyForecast.map(hour => `
        <div class="card">
            <h3>${new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
            <img src="https://weather.visualcrossing.com/static/img/icons/${hour.condition}.png" alt="${hour.condition}">
            <p>Temperature: ${hour.temp}${unitLabel}</p>
            <p>Condition: ${hour.condition}</p>
        </div>
    `).join('');
}

function showLoading() {
    weatherInfo.innerHTML = '<div class="loader"></div>';
    forecastInfo.innerHTML = '<div class="loader"></div>';
}

function hideLoading() {
    weatherInfo.innerHTML = '';
    forecastInfo.innerHTML = '';
}

function showLoadingHourly() {
    hourlyInfo.innerHTML = '<div class="loader"></div>';
}

function hideLoadingHourly() {
    hourlyInfo.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        const location = await getLocationName(latitude, longitude);
        locationInput.value = location;
        getWeatherData(location);
    } catch (error) {
        console.error('Error getting current location:', error);
        alert('Could not fetch your current location. Please enter manually.');
    }
});

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject('Geolocation is not supported by this browser.');
        }
    });
}

async function getLocationName(latitude, longitude) {
    const response = await fetch(`https://geocode.xyz/${latitude},${longitude}?json=1`);
    const data = await response.json();
    return `${data.city}, ${data.country}`;
}
