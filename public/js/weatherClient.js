// public/js/weatherClient.js

export async function fetchWeather() {
  try {
    const response = await fetch(
      "/api/weather?latitude=37.57&longitude=126.98&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation,windspeed_10m,weathercode&daily=sunrise,sunset&timezone=Asia%2FSeoul"
    );
    if (!response.ok) throw new Error("API 호출 실패");

    const data = await response.json();
    const weatherElement = document.getElementById("weather");

    const temp = data.current_weather.temperature;
    const wind = data.current_weather.windspeed;
    const humidity = data.hourly.relative_humidity_2m[0];
    const precipitation = data.hourly.precipitation[0];
    const sunrise = data.daily.sunrise[0];
    const sunset = data.daily.sunset[0];

    weatherElement.innerText =
      `현재 기온: ${temp}°C\n` +
      `풍속: ${wind} km/h\n` +
      `습도: ${humidity}%\n` +
      `강수량: ${precipitation} mm\n` +
      `일출: ${sunrise}\n` +
      `일몰: ${sunset}`;

    const code = data.current_weather.weathercode;
    const { updateBackground } = await import("./weatherBackground.js");
    updateBackground(code);
  } catch (error) {
    console.error("날씨 정보를 불러오는 데 실패했습니다.", error);
  }
}

document.addEventListener("DOMContentLoaded", fetchWeather);
