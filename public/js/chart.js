// This function receives hourly data and renders the chart into the element with id "rain-chart"
export function renderRainChart(hourlyData) {
  const container = document.getElementById("rain-chart");
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
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 5,
          right: 5,
          bottom: 5,
          left: 5,
        },
      },
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
        x: {
          ticks: {
            font: {
              size: 10,
            },
            maxTicksLimit: 8,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 10,
            },
            maxTicksLimit: 6,
          },
          title: {
            display: true,
            text: "강수량 (mm)",
            font: {
              size: 11,
            },
          },
        },
      },
    },
  };

  console.log("Rendering rain chart with data:", data);
  new Chart(ctx, config);
}

// Render temperature chart
export function renderTempChart(hourlyData, canvas) {
  if (!canvas) {
    console.error("Canvas element is missing");
    return;
  }

  const ctx = canvas.getContext("2d");

  const labels = hourlyData.time.slice(0, 24).map((t) => {
    const date = new Date(t);
    return `${date.getHours()}시`;
  });

  const data = {
    labels,
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

  const config = {
    type: "line",
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 5,
          right: 5,
          bottom: 5,
          left: 5,
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.y} °C`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: 10,
            },
            maxTicksLimit: 8,
          },
        },
        y: {
          beginAtZero: false,
          ticks: {
            font: {
              size: 10,
            },
            maxTicksLimit: 5,
            padding: 5,
          },
          grid: {
            display: true,
            drawBorder: false,
          },
          title: {
            display: true,
            text: "기온 (°C)",
            font: {
              size: 11,
            },
            padding: {
              top: 5,
              bottom: 5,
            },
          },
        },
      },
    },
  };

  // 기존에 차트가 있으면 제거하고 새로 그리기
  if (canvas.chartInstance) {
    canvas.chartInstance.destroy();
  }
  console.log("Rendering temp chart with data:", data);

  canvas.chartInstance = new Chart(ctx, config);
}

// Render UV index chart
export function renderUvChart(hourlyData) {
  console.log("🧪 전체 hourlyData 확인:", hourlyData);
  console.log("🔥 renderUvChart called");
  const container = document.getElementById("uv-chart");
  console.log("📊 uv-chart container found:", container);
  console.log("🌞 uv_index data:", hourlyData.uv_index);

  if (!container) return;
  if (!hourlyData || !hourlyData.uv_index || !hourlyData.time) {
    console.error("🚨 uv_index or time data is missing in hourlyData");
    return;
  }

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
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 5,
          right: 5,
          bottom: 5,
          left: 5,
        },
      },
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
        x: {
          ticks: {
            font: {
              size: 10,
            },
            maxTicksLimit: 8,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 10,
            },
            maxTicksLimit: 5,
            padding: 5,
          },
          grid: {
            display: true,
            drawBorder: false,
          },
          title: {
            display: true,
            text: "자외선 지수",
            font: {
              size: 11,
            },
            padding: {
              top: 5,
              bottom: 5,
            },
          },
        },
      },
    },
  };

  new Chart(ctx, config);
}

// Render all charts from external hourly data
export function fetchAllCharts(hourlyData) {
  const rainContainer = document.getElementById("rain-chart");
  const tempContainer = document.getElementById("temp-chart");
  const uvContainer = document.getElementById("uv-chart");

  if (rainContainer && hourlyData.precipitation) {
    rainContainer.innerHTML = "";
    const rainData = {
      time: hourlyData.time,
      precipitation: hourlyData.precipitation,
    };
    renderRainChart(rainData);
  }

  if (tempContainer && hourlyData.temperature_2m) {
    const tempCanvas = document.createElement("canvas");
    tempContainer.innerHTML = "";
    tempContainer.appendChild(tempCanvas);
    const tempData = {
      time: hourlyData.time,
      temperature_2m: hourlyData.temperature_2m,
    };
    renderTempChart(tempData, tempCanvas);
  }

  if (uvContainer && hourlyData.uv_index) {
    const uvCanvas = document.createElement("canvas");
    uvContainer.innerHTML = "";
    uvContainer.appendChild(uvCanvas);
    const uvData = {
      time: hourlyData.time,
      uv_index: hourlyData.uv_index,
    };
    renderUvChart(uvData);
  }
}
