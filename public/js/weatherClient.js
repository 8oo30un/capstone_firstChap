// public/js/weatherClient.js

export async function fetchWeather() {
  try {
    const response = await fetch(
      "/api/weather?latitude=37.57&longitude=126.98"
    );
    if (!response.ok) throw new Error("API 호출 실패");

    const data = await response.json();
    const weatherElement = document.getElementById("weather");
    const temp = data.current_weather.temperature;
    const wind = data.current_weather.windspeed;
    weatherElement.innerText = `현재 기온: ${temp}°C, 풍속: ${wind} km/h`;
  } catch (error) {
    console.error("날씨 정보를 불러오는 데 실패했습니다.", error);
  }
}

document.addEventListener("DOMContentLoaded", fetchWeather);
