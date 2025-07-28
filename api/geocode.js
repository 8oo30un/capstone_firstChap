export default async function handler(req, res) {
  const { query } = req;
  const place = query.place;

  if (!place) {
    return res.status(400).json({ error: "Missing 'place' query parameter" });
  }

  try {
    const apiKey = process.env.OPEN_CAGE_API_KEY;
    console.log("API 키:", apiKey);

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      place
    )}&key=${apiKey}&language=en&limit=1`;
    console.log("요청 URL:", url);

    const response = await fetch(url);
    console.log("API 응답 상태:", response.status);

    if (!response.ok) {
      throw new Error("Geocoding API error");
    }

    const data = await response.json();
    if (data.results.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    const { lat, lng } = data.results[0].geometry;
    res.status(200).json({ lat, lng });
  } catch (error) {
    console.error("Geocode API failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
