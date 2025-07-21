// 즐겨찾기 항목 저장 및 불러오기
export function saveFavorite(locationName, lat, lng, imageUrl) {
  const favorites = JSON.parse(
    localStorage.getItem("weatherFavorites") || "[]"
  );
  const exists = favorites.some((fav) => fav.name === locationName);
  if (exists) return;

  favorites.push({ name: locationName, lat, lng, imageUrl });
  localStorage.setItem("weatherFavorites", JSON.stringify(favorites));
  renderFavorites();
}

export function renderFavorites() {
  const favorites = JSON.parse(
    localStorage.getItem("weatherFavorites") || "[]"
  );
  const list = document.getElementById("favorites-list");
  list.innerHTML = "";

  favorites.forEach(({ name, lat, lng, imageUrl }) => {
    const item = document.createElement("div");
    item.className =
      "bg-white/10 p-3 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-white/20 transition";

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = name;
    img.className = "w-16 h-16 object-cover rounded-md";

    const title = document.createElement("div");
    title.textContent = name;

    item.appendChild(img);
    item.appendChild(title);

    item.addEventListener("click", async function () {
      console.log("📍 즐겨찾기 선택됨:", name, lat, lng);

      // 1. 글로벌 좌표 설정
      window.currentWeatherLat = lat;
      window.currentWeatherLng = lng;
      window.isManualLocationSelected = true;

      // 2. 날씨 정보 가져오기
      const { fetchWeather } = await import("./weatherClient.js");
      fetchWeather(lat, lng);

      // 3. 차트 다시 렌더링
      if (typeof window.setCurrentLocationAndRenderCharts === "function") {
        window.setCurrentLocationAndRenderCharts(lat, lng, name);
      }

      // 4. 배경 이미지 업데이트
      const { updateBackground } = await import("./weatherBackground.js");
      if (typeof updateBackground === "function" && window.currentWeatherCode) {
        updateBackground(window.currentWeatherCode);
      }

      // 5. UI 요소 업데이트
      document.getElementById("location-name").textContent = name;
      document.getElementById("location-name-back").textContent = name;
      document.getElementById("front-card-image").src = imageUrl;

      document.getElementById("weather-keyword").style.display = "block";
      document.getElementById("weather").style.display = "block";
      document.getElementById("rain-chart").classList.remove("hidden");
      document.getElementById("temp-chart").classList.remove("hidden");
      document.getElementById("uv-chart").classList.remove("hidden");
      document.getElementById("temperature-range").style.display = "block";
      document.getElementById("uv-index").style.display = "block";
    });

    list.appendChild(item);
  });
}
