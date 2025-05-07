document.addEventListener("DOMContentLoaded", function () {
    const trendsDiv = document.getElementById("trends-vis");
  
    // Create a flex container to hold dropdown and chart side by side
    const flexContainer = document.createElement("div");
    flexContainer.style.display = "flex";
    flexContainer.style.flexDirection = "row";
    flexContainer.style.alignItems = "flex-start";
    flexContainer.style.justifyContent = "center";
    flexContainer.style.gap = "32px";
    flexContainer.style.width = "100%";
    flexContainer.style.height = "100%";
  
    // Move the trendsDiv into the flex container
    trendsDiv.parentNode.insertBefore(flexContainer, trendsDiv);
    flexContainer.appendChild(trendsDiv);
  
    // Create dropdown
    const dropdown = document.createElement("select");
    dropdown.multiple = true;
    dropdown.size = 8;
    dropdown.style.marginBottom = "0";
    dropdown.style.marginTop = "8px";
    dropdown.style.padding = "10px 16px";
    dropdown.style.borderRadius = "8px";
    dropdown.style.border = "1px solid #ccc";
    dropdown.style.fontSize = "1rem";
    dropdown.style.fontFamily = "'Segoe UI', sans-serif";
    dropdown.style.backgroundColor = "#f9f9f9";
    dropdown.style.maxWidth = "300px";
    dropdown.style.minWidth = "180px";
    dropdown.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
    dropdown.style.height = "auto";
    flexContainer.insertBefore(dropdown, trendsDiv);
  
    // Make the div responsive
    trendsDiv.style.width = "100%";
    trendsDiv.style.height = "600px";
    trendsDiv.style.minHeight = "400px";
    trendsDiv.style.maxWidth = "100%";
  
    // Color palette (same as other visuals)
    const palette = ["#996835", "#b38b6d", "#d6ad60", "#ede3d5", "#122620"];
  
    // Load and parse CSV
    Papa.parse("https://raw.githubusercontent.com/Andrea2002-06/Andrea2002-06.github.io/refs/heads/main/europai_lakhatasi_adatbazis.csv", {
      download: true,
      header: true,
      complete: function (results) {
        const raw = results.data;
        const grouped = {};
  
        raw.forEach(row => {
          const city = row["Város"];
          const year = row["Év"];
          const ratio = parseFloat(row["Lakhatási arány (%)"]);
  
          if (!city || !year || isNaN(ratio)) return;
  
          const key = `${city}_${year}`;
          if (!grouped[key]) {
            grouped[key] = { city, year, ratios: [] };
          }
          grouped[key].ratios.push(ratio);
        });
  
        const cityAverages = {};
        Object.values(grouped).forEach(entry => {
          const { city, year, ratios } = entry;
          if (!cityAverages[city]) cityAverages[city] = {};
          cityAverages[city][year] = ratios.reduce((a, b) => a + b, 0) / ratios.length;
        });
  
        const cityList = Object.keys(cityAverages).sort();
        cityList.forEach(city => {
          const opt = document.createElement("option");
          opt.value = city;
          opt.textContent = city;
          dropdown.appendChild(opt);
        });
  
        // Draw chart
        function updateChart() {
          const selected = Array.from(dropdown.selectedOptions).map(opt => opt.value).slice(0, 5);
          // Deselect extra if more than 5
          for (let i = 0; i < dropdown.options.length; i++) {
            dropdown.options[i].disabled = selected.length >= 5 && !dropdown.options[i].selected;
          }
          const traces = selected.map((city, idx) => {
            const yearData = cityAverages[city];
            const years = Object.keys(yearData).sort();
            return {
              x: years,
              y: years.map(y => yearData[y]),
              name: city,
              type: "scatter",
              mode: "lines+markers",
              line: {
                shape: "spline",
                width: 2,
                color: palette[idx % palette.length]
              },
              marker: {
                color: palette[idx % palette.length],
                line: { color: "#fff", width: 1 }
              },
              fill: "tozeroy",
              fillcolor: palette[idx % palette.length] + "29", // ~16% opacity
              opacity: 0.18
            };
          });
  
          const layout = {
            title: "Lakhatási arány (%) városonként (2020–2024)",
            xaxis: {
              title: "Év",
              tickmode: "linear"
            },
            yaxis: {
              title: "Lakhatási arány (%)",
              rangemode: "tozero"
            },
            plot_bgcolor: "#ffffff",
            paper_bgcolor: "#ffffff",
            font: {
              family: "'Segoe UI', sans-serif",
              size: 14,
              color: "#122620"
            },
            legend: {
              bgcolor: "#fff",
              bordercolor: "#eee",
              borderwidth: 1
            },
            autosize: true,
            width: trendsDiv.offsetWidth,
            height: trendsDiv.offsetHeight
          };
  
          Plotly.newPlot("trends-vis", traces, layout, { responsive: true });
        }
  
        dropdown.addEventListener("change", updateChart);
  
        // Select default cities
        for (let i = 0; i < Math.min(3, dropdown.options.length); i++) {
          dropdown.options[i].selected = true;
        }
        updateChart();
      }
    });
  });
  