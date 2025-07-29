// public/js/weatherClient.js

export async function fetchWeather(inputLat = null, inputLng = null) {
  try {
    let latitude = inputLat;
    let longitude = inputLng;

    if (
      (latitude === null || longitude === null) &&
      !window.isManualLocationSelected
    ) {
      const getPosition = () =>
        new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
        );

      const position = await getPosition().catch(() => null);
      latitude = position?.coords.latitude ?? 37.57;
      longitude = position?.coords.longitude ?? 126.98;
    }

    // Set window variables and call updateRainChartWithNewLocation if available
    window.currentWeatherLat = latitude;
    window.currentWeatherLng = longitude;
    if (window.updateRainChartWithNewLocation) {
      window.updateRainChartWithNewLocation(latitude, longitude);
    }
    console.log("위치 설정됨:", latitude, longitude);

    // Force HTTPS if loaded from local file or insecure context
    if (location.protocol !== "https:" && location.protocol !== "http:") {
      location.href = location.href.replace(/^http:/, "https:");
    }

    let cityName = "unknown";
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
          "unknown";
      } else {
        console.warn("fail response that serverless location:", geoRes.status);
      }
    } catch (e) {
      console.warn("서버리스 위치 정보를 가져오는 데 실패했습니다.", e);
    }
    const locationEl = document.getElementById("location-name");
    const locationBackEl = document.getElementById("location-name-back");

    if (locationEl) locationEl.innerText = cityName;
    if (locationBackEl) locationBackEl.innerText = cityName;

    // background image loading code
    try {
      const UNSPLASH_ACCESS_KEY = "6opG7_SAJq3D33Om0rA9MZ4SwiangrDuHuR9zu96Vvs";

      const unsplashResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          cityName
        )}&client_id=${UNSPLASH_ACCESS_KEY}&orientation=landscape&per_page=1`
      );

      if (unsplashResponse.ok) {
        const unsplashData = await unsplashResponse.json();
        const imageUrl =
          unsplashData.results?.[0]?.urls?.regular ||
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb"; //  fallback

        const frontCardImage = document.getElementById("front-card-image");
        if (frontCardImage) {
          frontCardImage.src = imageUrl;
          frontCardImage.alt = `${cityName} 풍경 이미지`;
        }
      } else {
        console.warn("Unsplash 이미지 요청 실패:", unsplashResponse.status);
      }
    } catch (e) {
      console.warn("이미지 요청 중 에러 발생:", e);
    }

    // Updated fetch URL with temperature_2m_max and temperature_2m_min added
    const response = await fetch(
      `/api/weather?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation,windspeed_10m,weathercode,uv_index&daily=sunrise,sunset,uv_index_max,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul`
    );
    if (!response.ok) throw new Error("API 호출 실패");

    const data = await response.json();
    window.weatherHourlyData = {
      time: data.hourly.time,
      temperature_2m: data.hourly?.temperature_2m || [],
      uv_index: data.hourly?.uv_index || [],
      precipitation: data.hourly?.precipitation || [],
    };
    console.log("🌡️ 시간별 기온 및 자외선 데이터:", window.weatherHourlyData);
    const weatherElement = document.getElementById("weather");

    if (weatherElement) {
      const temp = data.current_weather.temperature;
      const wind = data.current_weather.windspeed;
      const humidity = data.hourly.relative_humidity_2m[0];
      const precipitation = data.hourly.precipitation[0];

      weatherElement.innerText =
        `current temperature: ${temp}°C\n` +
        `wind speed: ${wind} km/h\n` +
        `humidity: ${humidity}%\n` +
        `precipitation: ${precipitation} mm\n`;
    }

    const code = data.current_weather.weathercode;
    const { updateBackground } = await import("./weatherBackground.js");
    updateBackground(code);

    // Preparation items recommendation and rendering
    function getWeatherItems(code) {
      if (code === 0) return ["sunglasses😎", "sunscreen🌞"];
      if (code >= 1 && code <= 3) return ["layer 🥼"];
      if (code >= 45 && code <= 48)
        return ["headlight🔦", " drive slowly🚗 🛑"];
      if (code >= 51 && code <= 67) return ["umbrella☔", "rain boots👢"];
      if (code >= 71 && code <= 86)
        return ["jacket🧥", "glaves🧤", "muffler🧣"];
      if (code >= 95) return ["umbrella☔", "headlight🔦", "raincoat🧥💧"];
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

    function updateBackCardDetails(data) {
      const tempRangeEl = document.getElementById("temperature-range");
      if (tempRangeEl) {
        const max = data.daily.temperature_2m_max?.[0];
        const min = data.daily.temperature_2m_min?.[0];
        tempRangeEl.textContent = `🌡️ Highest: ${max ?? "--"}℃ / Lowest: ${
          min ?? "--"
        }℃`;
      }

      const uvIndexEl = document.getElementById("uv-index");
      if (uvIndexEl) {
        const uv = data.daily.uv_index_max?.[0];
        uvIndexEl.textContent = `☀️ UV index: ${uv ?? "--"}`;
      }
    }

    updateBackCardDetails(data);

    const chartsModule = await import("./chart.js");

    window.weatherHourlyData = {
      time: data.hourly.time,
      temperature_2m: data.hourly?.temperature_2m || [],
      uv_index: data.hourly?.uv_index || [],
      precipitation: data.hourly?.precipitation || [],
    };
    console.log(
      "✅ 최신 window.weatherHourlyData 설정됨:",
      window.weatherHourlyData
    );

    if (typeof chartsModule.fetchAllCharts === "function") {
      console.log(
        "📈 fetchWeather에서 fetchAllCharts 호출됨 (with hourly data)"
      );
      chartsModule.fetchAllCharts(window.weatherHourlyData);
    } else {
      console.warn("⚠️ fetchAllCharts 함수가 chart.js에 존재하지 않음");
    }
  } catch (error) {
    console.error("날씨 정보를 불러오는 데 실패했습니다.", error);
  }
}

document.addEventListener("DOMContentLoaded", fetchWeather);
