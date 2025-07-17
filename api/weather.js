// api/weather.js

export default async function handler(req, res) {
  const { latitude, longitude, hourly, daily } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "latitude와 longitude가 필요합니다." });
  }

  const baseUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=Asia%2FSeoul`;
  const params = [];

  if (req.query.current_weather === "true") {
    params.push("current_weather=true");
  }

  if (hourly) {
    params.push(`hourly=${hourly}`);
  }

  if (daily) {
    params.push(`daily=${daily}`);
  }

  const url = `${baseUrl}&${params.join("&")}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: "Open-Meteo API 호출 실패" });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("API 호출 중 오류:", error);
    res.status(500).json({ error: "서버 오류" });
  }
}
