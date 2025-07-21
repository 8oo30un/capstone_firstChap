function getWeatherKeyword(code) {
  if (code === 0) return "clear sunny";
  if (code >= 1 && code <= 3) return "overcast cloudy";
  if (code >= 45 && code <= 48) return "dense fog over forest";
  if (code >= 51 && code <= 67) return "rainy day";
  if (code >= 71 && code <= 86) return "snowy winter";
  if (code >= 95) return "thunderstorm lightning";
  return "weather landscape";
}

export async function updateBackground(weatherCode) {
  const keyword = getWeatherKeyword(weatherCode);
  const keywordElement = document.getElementById("weather-keyword");
  if (keywordElement) keywordElement.innerText = keyword;
  const UNSPLASH_ACCESS_KEY = "6opG7_SAJq3D33Om0rA9MZ4SwiangrDuHuR9zu96Vvs"; // Replace with actual key

  const url = `https://api.unsplash.com/photos/random?query=${keyword}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const imageUrl = data.urls.full;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      document.body.style.backgroundImage = `url('${imageUrl}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";

      const spinner = document.getElementById("loading-spinner");
      if (spinner) spinner.style.display = "none";
    };
  } catch (error) {
    console.error("배경 이미지 불러오기 실패", error);
    // ✅ fallback 배경
    const body = document.body;
    switch (keyword) {
      case "clear sunny":
        body.style.background =
          "linear-gradient(to bottom right, #fceabb, #f8b500)";
        break;
      case "overcast cloudy":
        body.style.background =
          "linear-gradient(to bottom right, #bdc3c7, #2c3e50)";
        break;
      case "rainy day":
        body.style.background =
          "linear-gradient(to bottom right, #3a6073, #16222a)";
        break;
      case "snowy winter":
        body.style.background =
          "linear-gradient(to bottom right, #e6dada, #274046)";
        break;
      case "thunderstorm lightning":
        body.style.background =
          "linear-gradient(to bottom right, #373b44, #4286f4)";
        break;
      default:
        body.style.background =
          "linear-gradient(to bottom right, #a1c4fd, #c2e9fb)";
    }

    body.style.backgroundSize = "cover";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundPosition = "center";

    const spinner = document.getElementById("loading-spinner");
    if (spinner) spinner.style.display = "none";
  }
}
