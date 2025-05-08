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
    flexContainer.style.height = "500px";
    flexContainer.style.overflow = "hidden";
    flexContainer.style.position = "relative";
    flexContainer.style.minHeight = "500px";
    flexContainer.style.maxHeight = "500px";
  
    // Move the trendsDiv into the flex container
    trendsDiv.parentNode.insertBefore(flexContainer, trendsDiv);
    flexContainer.appendChild(trendsDiv);
  
    // Create dropdown
    const dropdown = document.createElement("select");
    dropdown.multiple = true;
    dropdown.size = 6;
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
    dropdown.style.overflowY = "auto";
    dropdown.style.position = "sticky";
    dropdown.style.top = "8px";
    flexContainer.insertBefore(dropdown, trendsDiv);
  
    // Make the div responsive with fixed dimensions
    trendsDiv.style.width = "calc(100% - 332px)"; // Account for dropdown width and gap
    trendsDiv.style.height = "500px";
    trendsDiv.style.minHeight = "500px";
    trendsDiv.style.maxHeight = "500px";
    trendsDiv.style.overflow = "hidden";
    trendsDiv.style.position = "relative";
  
    // Color palette for the chart
    const colorPalette = [
        '#8b6b4b', // deep warm brown
        '#5c7c3c', // deep forest green
        '#c4a484', // light warm brown
        '#8a9a5b', // medium olive green
        '#6b4b3c', // dark brown
        '#7c8558', // medium sage green
        '#d4b996', // pale brown
        '#4a5c2c', // dark forest green
        '#e5d5b5', // cream
        '#9baa6c'  // light sage
    ];
  
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
                color: colorPalette[idx % colorPalette.length]
              },
              marker: {
                color: colorPalette[idx % colorPalette.length],
                line: { color: "#fff", width: 1 }
              },
              fill: "tozeroy",
              fillcolor: colorPalette[idx % colorPalette.length] + "29", // ~16% opacity
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
              borderwidth: 1,
              y: 1.1,
              orientation: "h",
              x: 0.5,
              xanchor: "center"
            },
            autosize: true,
            width: trendsDiv.offsetWidth,
            height: 500,
            margin: {
              l: 50,
              r: 50,
              t: 80,
              b: 50,
              pad: 4
            }
          };
  
          Plotly.newPlot("trends-vis", traces, layout, { 
            responsive: true,
            displayModeBar: false,
            staticPlot: false
          });
        }
  
        dropdown.addEventListener("change", updateChart);
  
        // Select default cities
        for (let i = 0; i < Math.min(3, dropdown.options.length); i++) {
          dropdown.options[i].selected = true;
        }
        updateChart();

        // Add window resize handler
        window.addEventListener('resize', function() {
          updateChart();
        });
      }
    });
  });
  