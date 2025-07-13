// api/weather.js

export default async function handler(req, res) {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "latitude와 longitude가 필요합니다." });
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation,windspeed_10m,weathercode&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      ㅊ;
      return res.status(500).json({ error: "Open-Meteo API 호출 실패" });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("API 호출 중 오류:", error);
    res.status(500).json({ error: "서버 오류" });
  }
}
