import dotenv from "dotenv";
dotenv.config();

// api/reverse-geocode.js
export default async function handler(req, res) {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "latitude와 longitude가 필요합니다." });
  }

  const OPEN_CAGE_API_KEY = process.env.OPEN_CAGE_API_KEY;

  if (!OPEN_CAGE_API_KEY) {
    return res.status(500).json({ error: "API 키가 설정되지 않았습니다." });
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPEN_CAGE_API_KEY}&language=ko`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("OpenCage API 호출 중 오류:", error);
    res.status(500).json({ error: "서버 오류" });
  }
}
