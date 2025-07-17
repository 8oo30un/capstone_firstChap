// Ensure weather info box is always visible
const weatherInfoBox = document.getElementById("weather-info-box");
if (weatherInfoBox?.classList.contains("hidden")) {
  weatherInfoBox.classList.remove("hidden");
}

// Function to update city name in the info box (legacy)
function updateWeatherCityName(name) {
  const cityNameEl = document.getElementById("weather-city-name");
  if (cityNameEl && name) {
    cityNameEl.textContent = `도시명: ${name}`;
  }
}

// Expose to window so it can be called from other modules
window.updateWeatherCityName = updateWeatherCityName;

let map, marker;
let selectedCoords = { lat: 37.57, lng: 126.98 };

const weatherIcons = {
  0: "☀️", // Clear
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌧️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "❄️",
  75: "❄️",
  95: "⛈️",
  99: "🌩️",
};

async function updateMarkerWithWeather(lat, lng) {
  try {
    const res = await fetch(
      `/api/weather?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=precipitation`
    );
    const data = await res.json();
    const code = data.current_weather?.weathercode ?? 0;

    // Update city name in mini info modal and legacy box
    try {
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        console.warn(
          "❗ 유효하지 않은 좌표로 reverse-geocode 요청을 중단합니다:",
          lat,
          lng
        );
        return;
      }
      console.log(
        "🌐 reverse-geocode 요청 URL:",
        `/api/reverse-geocode?latitude=${lat}&longitude=${lng}`
      );
      const geoRes = await fetch(
        `/api/reverse-geocode?latitude=${lat}&longitude=${lng}`
      );
      console.log("Reverse geocode response status:", geoRes.status);
      if (geoRes.ok) {
        const cityData = await geoRes.json();
        console.log("Reverse geocode data:", cityData);

        const cityNameFromResult =
          cityData.results?.[0]?.components?.city ||
          cityData.results?.[0]?.components?.town ||
          cityData.results?.[0]?.components?.village ||
          cityData.results?.[0]?.components?.county ||
          "알 수 없음";

        const miniCityEl = document.getElementById("mini-city-name");
        if (miniCityEl) {
          miniCityEl.textContent = `도시명: ${cityNameFromResult}`;
        }
        if (window.updateWeatherCityName) {
          window.updateWeatherCityName(cityNameFromResult);
        }
      } else {
        const errorText = await geoRes.text();
        console.warn("Reverse geocode 실패:", errorText);
      }
    } catch (e) {
      console.warn("도시명 가져오기 실패:", e);
    }

    const emoji = weatherIcons[code] || "❓";

    const icon = L.divIcon({
      className: "weather-emoji",
      html: `
        <div style="
          font-size: 1.5rem;
          background: white;
          border-radius: 50%;
          padding: 4px;
          box-shadow: 0 0 4px rgba(0,0,0,0.2);
          text-align: center;
        ">
          ${emoji}
        </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (marker) marker.remove();
    marker = L.marker([lat, lng], {
      icon,
      draggable: true,
    }).addTo(map);

    marker.on("dragend", (e) => {
      selectedCoords = marker.getLatLng();
      updateMarkerWithWeather(selectedCoords.lat, selectedCoords.lng);
    });

    // Remove existing overlays
    if (window.windCircle) {
      map.removeLayer(window.windCircle);
      window.windCircle = null;
    }
    if (window.rainCircle) {
      map.removeLayer(window.rainCircle);
      window.rainCircle = null;
    }

    const windSpeed = data.current_weather?.windspeed ?? 0;
    const precipitation = data.hourly?.precipitation?.[0] ?? 0;

    // Update mini info modal weather info text
    const miniWindEl = document.getElementById("mini-wind");
    const miniPrecipitationEl = document.getElementById("mini-precipitation");

    if (miniWindEl) miniWindEl.textContent = `풍속: ${windSpeed} km/h 💨`;
    if (miniPrecipitationEl)
      miniPrecipitationEl.textContent = `강수량: ${precipitation} mm ☔`;
  } catch (err) {
    console.error("Weather fetch failed:", err);
  }
}

function initMap() {
  map = L.map("leaflet-map").setView(
    [selectedCoords.lat, selectedCoords.lng],
    13
  );

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        "&copy; <a href='https://carto.com/'>CARTO</a> | Map data © OpenStreetMap contributors",
      subdomains: "abcd",
      maxZoom: 19,
    }
  ).addTo(map);

  updateMarkerWithWeather(selectedCoords.lat, selectedCoords.lng);

  map.on("click", function (e) {
    selectedCoords = e.latlng;
    updateMarkerWithWeather(e.latlng.lat, e.latlng.lng);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const modalContainer = document.getElementById("map-modal-container");
  const openBtn = document.getElementById("open-map-modal");
  const closeBtn = document.getElementById("close-map-modal");
  const confirmBtn = document.getElementById("confirm-location");

  openBtn.addEventListener("click", () => {
    modalContainer.classList.remove("hidden");
    if (!map) initMap();
    else map.invalidateSize();
  });

  closeBtn.addEventListener("click", () => {
    modalContainer.classList.add("hidden");
  });

  confirmBtn.addEventListener("click", async () => {
    modalContainer.classList.add("hidden");
    const { fetchWeather } = await import("./weatherClient.js");
    fetchWeather(selectedCoords.lat, selectedCoords.lng);
  });

  // Search button and input for place search
  const searchBtn = document.getElementById("search-place");
  const searchInput = document.getElementById("place-input");

  searchBtn.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
      console.log("🔍 검색어:", query);
      const response = await fetch(
        `/api/geocode?place=${encodeURIComponent(query)}`
      );
      console.log("📡 응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ 지오코딩 실패 응답:", errorText);
        throw new Error("Geocoding failed");
      }

      const data = await response.json();
      console.log("📦 응답 데이터:", data);

      const lat = data.lat;
      const lng = data.lng;

      selectedCoords = { lat, lng };
      map.setView([lat, lng], 13);
      updateMarkerWithWeather(lat, lng);
    } catch (error) {
      console.error("❌ 검색 실패:", error);
    }
  });
});
