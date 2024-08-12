import './style.css';
import clearDay from './clear-day.svg';
import partlyCloudyDay from './partly-cloudy-day.svg';
import partlyCloudyNight from './partly-cloudy-night.svg';
import clearNight from './clear-night.svg';
import rain from './rain.svg';
import snow from './snow.svg';
import fog from './fog.svg';
import wind from './wind.svg';
import cloudy from './cloudy.svg';
import { format, isBefore, isToday, isTomorrow, addDays } from 'date-fns';

const locationForm = document.querySelector('form');
const locationInput = document.getElementById('location-input');

let location = 'Zagreb';
let unit = 'metric';

const getIcon = function getCorrespondingWeatherIcon(weather) {
  switch (weather) {
    case 'clear-day':
      return clearDay;
    case 'partly-cloudy-day':
      return partlyCloudyDay;
    case 'partly-cloudy-night':
      return partlyCloudyNight;
    case 'clear-night':
      return clearNight;
    case 'rain':
      return rain;
    case 'snow':
      return snow;
    case 'fog':
      return fog;
    case 'wind':
      return wind;
    case 'cloudy':
      return cloudy;
    default:
      return null;
  }
};

function formatDate(dateString) {
  const sevenDaysFromToday = addDays(new Date(), 6);

  const year = dateString.slice(0, 4);
  const month = dateString.slice(5, 7) - 1;
  const day = dateString.slice(8, 10);

  const newDate = new Date(year, month, day);

  if (isToday(newDate)) {
    return 'Today';
  } else if (isTomorrow(newDate)) {
    return 'Tomorrow';
  } else if (isBefore(newDate, sevenDaysFromToday)) {
    return format(newDate, 'EEEE');
  } else {
    return format(newDate, 'do MMM y');
  }
}

const getData = async function getWeatherData() {
  const response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/next10days?key=JV3JYYEPPXM5J6NXHJZ5UF3FY&unitGroup=${unit}&include=current%2Cdays&elements=datetime,icon,temp,tempmax,tempmin,precipprob,uvindex,feelslike,humidity,windspeed,conditions`,
    { mode: 'cors' }
  );

  const parsedResponse = await response.json();

  console.log(parsedResponse);

  return {
    address: parsedResponse.resolvedAddress,
    days: parsedResponse.days,
    current: parsedResponse.currentConditions,
  };
};

function displayWeather() {
  const tenDayWeatherContainer = document.querySelector('.ten-day-weather');
  tenDayWeatherContainer.innerHTML = '';

  //10 day weather
  getData().then((data) => {
    locationInput.value = data.address;

    data.days.forEach((item) => {
      const day = document.createElement('div');
      day.classList.add('day-item');

      const icon = document.createElement('img');
      icon.src = getIcon(item.icon);

      const date = document.createElement('p');
      date.textContent = formatDate(item.datetime);

      const temperature = document.createElement('p');
      temperature.classList.add('temperature');
      temperature.textContent = item.tempmax + '°/';
      const minTemp = document.createElement('span');
      minTemp.classList.add('min-temp');
      minTemp.textContent = item.tempmin + '°';
      temperature.append(minTemp);

      day.append(icon, date, temperature);

      tenDayWeatherContainer.append(day);
    });

    //current weather
    const currentWeatherIcon = document.querySelector('.current-weather-icon');
    const currentTemp = document.querySelector('.current-temp');
    const currentConditions = document.querySelector('.conditions');
    const currentFeelsLike = document.querySelector('.feels-like');
    const currentUv = document.querySelector('.uv-index .value');
    const currentHumdity = document.querySelector('.humidity .value');
    const currentWind = document.querySelector('.wind .value');
    const currentPrecipProb = document.querySelector('.precip-prob .value');

    currentWeatherIcon.src = getIcon(data.current.icon);
    currentTemp.textContent = data.current.temp + '°';
    currentConditions.textContent = data.current.conditions;
    currentFeelsLike.textContent = data.current.feelslike;
    currentUv.textContent = data.current.uvindex;
    currentHumdity.textContent = data.current.humidity;
    currentWind.textContent = data.current.windspeed;
    currentPrecipProb.textContent = data.current.precipprob;
  });
}

displayWeather();

locationForm.addEventListener('submit', (event) => {
  event.preventDefault();

  location = locationInput.value;
  displayWeather();
});
