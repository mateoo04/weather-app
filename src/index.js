import './style.css';

const getData = async function getWeatherData() {
  const response = await fetch(
    'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Mostar/next10days?key=JV3JYYEPPXM5J6NXHJZ5UF3FY&unitGroup=metric&include=days&elements=datetime,icon,tempmax,tempmin,precipprob,uvindex',
    { mode: 'cors' }
  );

  const parsedResponse = await response.json();

  return parsedResponse.days;
};

function displayWeather() {
  const tenDayWeather = document.querySelector('.ten-day-weather');

  getData().then((days) => {
    days.forEach((item) => {
      const day = document.createElement('div');

      const icon = document.createElement('p');
      icon.textContent = item.icon;

      const tempContainer = document.createElement('div');
      tempContainer.classList.add('temp-container');

      const maxTemp = document.createElement('p');
      maxTemp.textContent = item.tempmax;
      const minTemp = document.createElement('p');
      minTemp.textContent = item.tempmin;
      tempContainer.append(maxTemp, minTemp);

      day.append(icon, tempContainer);

      tenDayWeather.append(day);
    });
  });
}

displayWeather();
