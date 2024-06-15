const apiKey = 'MAGYW7D98CFJ432YHC2Y6BNKN';

export async function fetchCurrentWeather(location) {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&key=${apiKey}&include=current`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Weather data not available');
        }
        const data = await response.json();
        const currentWeather = {
            location: data.resolvedAddress,
            temperature: data.currentConditions.temp,
            condition: data.currentConditions.icon,
            humidity: data.currentConditions.humidity,
            windSpeed: data.currentConditions.wspd,
            sunrise: data.currentConditions.sunrise,
            sunset: data.currentConditions.sunset
        };
        return currentWeather;
    } catch (error) {
        throw new Error('Failed to fetch current weather');
    }
}

export async function fetchWeatherForecast(location) {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&key=${apiKey}&include=daily`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Weather data not available');
        }
        const data = await response.json();
        const forecast = data.days.map(day => ({
            date: day.datetime,
            maxTemp: day.tempmax,
            minTemp: day.tempmin,
            condition: day.icon
        }));
        return forecast;
    } catch (error) {
        throw new Error('Failed to fetch weather forecast');
    }
}

export async function fetchHourlyForecast(date) {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${date}?unitGroup=metric&key=${apiKey}&include=hours`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Hourly data not available');
        }
        const data = await response.json();
        const hourlyForecast = data.hours.map(hour => ({
            time: hour.datetime,
            temp: hour.temp,
            condition: hour.icon
        }));
        return hourlyForecast;
    } catch (error) {
        throw new Error('Failed to fetch hourly forecast');
    }
}
