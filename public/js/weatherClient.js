// public/js/weatherClient.js

export async function fetchWeather() {
  try {
    const getPosition = () =>
      new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

    const position = await getPosition().catch(() => null);
    const latitude = position?.coords.latitude ?? 37.57;
    const longitude = position?.coords.longitude ?? 126.98;

    // Force HTTPS if loaded from local file or insecure context
    if (location.protocol !== "https:" && location.protocol !== "http:") {
      location.href = location.href.replace(/^http:/, "https:");
    }

    console.log("Geolocation:", latitude, longitude);

    let cityName = "알 수 없음";
    try {
      const geoRes = await fetch(
        `/api/reverse-geocode?latitude=${latitude}&longitude=${longitude}`
      );

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const result = geoData.results?.[0];
        cityName =
          result?.components?.city ||
          result?.components?.town ||
          result?.components?.village ||
          result?.components?.county ||
          result?.components?.state ||
          "알 수 없음";
      } else {
        console.warn("서버리스 위치 응답 실패:", geoRes.status);
      }
    } catch (e) {
      console.warn("서버리스 위치 정보를 가져오는 데 실패했습니다.", e);
    }
    const locationEl = document.getElementById("location-name");
    if (locationEl) locationEl.innerText = cityName;

    const response = await fetch(
      `/api/weather?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation,windspeed_10m,weathercode&daily=sunrise,sunset&timezone=Asia%2FSeoul`
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
