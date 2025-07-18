// Assumes Chart is loaded globally via CDN in index.html

// This function receives hourly data and renders the chart into the element with id "rain-chart"
export function renderRainChart(hourlyData) {
  const container = document.getElementById("rain-chart");
  console.log("Chart container:", container);
  if (!container) return;

  // Clear existing content
  container.innerHTML = "";

  // Create a canvas element
  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  const labels = hourlyData.time.slice(0, 24).map((t) => {
    const date = new Date(t);
    return `${date.getHours()}시`;
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: "강수량 (mm)",
        data: hourlyData.precipitation.slice(0, 24),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.parsed.y} mm`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "강수량 (mm)",
          },
        },
      },
    },
  };

  console.log("Rendering rain chart with data:", data);
  new Chart(ctx, config);
}

// Render temperature chart
export function renderTempChart(hourlyData) {
  const container = document.getElementById("temp-chart");
  console.log("📊 temp-chart container found:", container);
  console.log("🌡️ temperature_2m data:", hourlyData.temperature_2m);
  if (!container) return;

  container.innerHTML = "";

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  const labels = hourlyData.time.slice(0, 24).map((t) => {
    const date = new Date(t);
    return `${date.getHours()}시`;
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: "기온 (°C)",
        data: hourlyData.temperature_2m.slice(0, 24),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };
  console.log("📈 Rendering temperature chart with data:", data);

  const config = {
    type: "line",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.parsed.y} °C`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "기온 (°C)",
          },
        },
      },
    },
  };

  new Chart(ctx, config);
}

// Render UV index chart
export function renderUvChart(hourlyData) {
  const container = document.getElementById("uv-chart");
  if (!container) return;

  container.innerHTML = "";

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  const labels = hourlyData.time.slice(0, 24).map((t) => {
    const date = new Date(t);
    return `${date.getHours()}시`;
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: "자외선 지수",
        data: hourlyData.uv_index.slice(0, 24),
        backgroundColor: "rgba(255, 206, 86, 0.5)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
      },
    ],
  };

  const config = {
    type: "line",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.parsed.y}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "자외선 지수",
          },
        },
      },
    },
  };

  new Chart(ctx, config);
}
