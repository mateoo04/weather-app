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
const celsius = document.querySelector('.celsius');
const fahrenheit = document.querySelector('.fahrenheit');
const messageDialog = document.querySelector('.message-dialog');
const dismissDialogButton = document.querySelector('.dismiss-dialog-button');

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
  //new Date() returns today
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

function setBackgroundColor(weather) {
  const main = document.querySelector('main');
  const header = document.querySelector('header');
  const body = document.querySelector('body');

  if (weather === 'partly-cloudy-day' || weather === 'clear-day') {
    body.style.background = '#1096e3';
  } else if (weather === 'partly-cloudy-night' || weather === 'clear-night') {
    body.style.background = '#005a9e';
  } else {
    body.style.background = '#7a1c94';
  }
}

function switchUnit(chosenUnit) {
  if (chosenUnit === 'metric') {
    unit = 'metric';
    fahrenheit.style.fontWeight = 'normal';
    celsius.style.fontWeight = '600';
  } else if (chosenUnit === 'us') {
    unit = 'us';
    celsius.style.fontWeight = 'normal';
    fahrenheit.style.fontWeight = '600';
  }

  displayWeather();
}

const getGif = async function getAppropriateGifForWeather(weather) {
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/translate?api_key=9A6HIUxYMMcj68L4wiXV1weChgm4dG4v&s=${weather}`,
      { mode: 'cors' }
    );

    const parsedResponse = await response.json();

    return parsedResponse.data.images.fixed_height.url;
  } catch (error) {
    console.log(error);
  }
};

function addGif(weather, element) {
  let weatherDescription = '';

  if (weather === 'clear-day') {
    weatherDescription = 'sunny';
  } else if (weather === 'clear-night') {
    weatherDescription = 'night-sky';
  } else {
    weatherDescription = weather;
  }

  getGif(weatherDescription).then((url) => {
    element.src = url;
  });
}

const getData = async function getWeatherData() {
  const response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/next10days?key=JV3JYYEPPXM5J6NXHJZ5UF3FY&unitGroup=${unit}&include=current%2Cdays&elements=datetime,icon,temp,tempmax,tempmin,precipprob,uvindex,feelslike,humidity,windspeed,conditions`,
    { mode: 'cors' }
  );

  const parsedResponse = await response.json();

  return {
    address: parsedResponse.resolvedAddress,
    days: parsedResponse.days,
    current: parsedResponse.currentConditions,
  };
};

function displayCurrentWeather(currentData) {
  const currentWeatherContainer = document.querySelector('.current-weather');
  currentWeatherContainer.innerHTML = '';

  const nowElement = document.createElement('p');
  nowElement.textContent = 'Now';
  nowElement.classList.add('bold');

  const basicInfo = document.createElement('div');
  basicInfo.classList.add('basic-info');

  const currentWeatherIcon = document.createElement('img');
  currentWeatherIcon.classList.add('current-weather-icon');
  currentWeatherIcon.src = getIcon(currentData.icon);

  const currentTemp = document.createElement('p');
  currentTemp.classList.add('current-temp');
  currentTemp.textContent = currentData.temp + '°';

  basicInfo.append(currentWeatherIcon, currentTemp);

  const currentConditions = document.createElement('p');
  currentConditions.classList.add('conditions', 'bold');
  currentConditions.textContent = currentData.conditions;

  const currentFeelsLike = document.createElement('p');
  currentFeelsLike.textContent = 'Feels like ' + currentData.feelslike + '°';

  const dataList = document.createElement('ul');

  const dataArray = [
    { title: 'UV Index', data: currentData.uvindex },
    { title: 'Humidity', data: currentData.humidity + '%' },
    {
      title: 'Wind',
      data: currentData.windspeed + (unit === 'metric' ? ' km/h' : ' mi/h'),
    },
    {
      title: 'Precipation probability',
      data: currentData.precipprob + '%',
    },
  ];

  dataArray.forEach((item) => {
    const listItem = document.createElement('li');

    const itemTitle = document.createElement('span');
    itemTitle.classList.add('bold');
    itemTitle.textContent = item.title;

    listItem.append(itemTitle, ' ', item.data);

    dataList.append(listItem);
  });

  const gifImg = document.createElement('img');
  gifImg.classList.add('gif');
  try {
    addGif(currentData.icon, gifImg);
  } catch (error) {
    console.log('Error while loading gif', error);
  }

  currentWeatherContainer.append(
    nowElement,
    basicInfo,
    currentConditions,
    currentFeelsLike,
    dataList,
    gifImg
  );

  setBackgroundColor(currentData.icon);
}

function diplayDailyWeather(days) {
  const tenDayWeatherContainer = document.querySelector('.ten-day-weather');
  tenDayWeatherContainer.innerHTML = '';

  days.forEach((item) => {
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
}

function displayWeather() {
  const loader = document.querySelector('.loader');
  loader.style.display = 'block';

  //10 day weather
  getData()
    .then((data) => {
      locationInput.value = data.address;

      loader.style.display = 'none';

      diplayDailyWeather(data.days);
      displayCurrentWeather(data.current);
    })
    .catch((error) => {
      console.log(error);
      document.querySelector('.message-dialog p').textContent =
        'An error occured while loading weather data.';

      loader.style.display = 'none';

      messageDialog.showModal();
    });
}

locationForm.addEventListener('submit', (event) => {
  event.preventDefault();

  location = locationInput.value;
  displayWeather();
});

celsius.addEventListener('click', () => {
  switchUnit('metric');
});

fahrenheit.addEventListener('click', () => {
  switchUnit('us');
});

dismissDialogButton.addEventListener('click', () => {
  messageDialog.close();
});

switchUnit('metric');
