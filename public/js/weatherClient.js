export async function fetchWeather() {
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=37.57&longitude=126.98&current_weather=true"
    );
    const data = await response.json();
    const weather = document.getElementById("weather");
    weather.innerText = `기온: ${data.current_weather.temperature}°C`;
  } catch (err) {
    console.error("날씨 정보를 불러오는 데 실패했습니다.", err);
  }
}
document.addEventListener("DOMContentLoaded", fetchWeather);
