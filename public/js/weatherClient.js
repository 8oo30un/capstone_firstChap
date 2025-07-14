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
      `강수량: ${precipitation} mm\n`;

    const code = data.current_weather.weathercode;
    const { updateBackground } = await import("./weatherBackground.js");
    updateBackground(code);

    // Preparation items recommendation and rendering
    function getWeatherItems(code) {
      if (code === 0) return ["선글라스😎", "자외선 차단제🌞"];
      if (code >= 1 && code <= 3) return ["얇은 겉옷🥼"];
      if (code >= 45 && code <= 48) return ["전조등🔦", "감속 운전 🚗 🛑"];
      if (code >= 51 && code <= 67) return ["우산☔", "장화👢"];
      if (code >= 71 && code <= 86)
        return ["두꺼운 옷🧥", "장갑🧤", "목도리🧣"];
      if (code >= 95) return ["우산☔", "비상 손전등🔦", "우비🧥💧"];
      return ["기본 준비물📝"];
    }

    function renderPreparationItems(code) {
      const items = getWeatherItems(code);
      const list = document.getElementById("prep-list");
      if (!list) return;
      list.innerHTML = "";
      items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
    }
    renderPreparationItems(code);
  } catch (error) {
    console.error("날씨 정보를 불러오는 데 실패했습니다.", error);
  }
}

document.addEventListener("DOMContentLoaded", fetchWeather);
