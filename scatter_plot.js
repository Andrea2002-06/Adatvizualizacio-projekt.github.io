const scatterPlotSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 700,
    "height": 500,
    "data": {
        "values": []
    },
    "mark": {
        "type": "point",
        "filled": true,
        "stroke": "#ffffff",
        "strokeWidth": 0.8,
        "size": 80
    },
    "encoding": {
        "x": {
            "field": "Jövedelem (€/hó)",
            "type": "quantitative",
            "title": "Income (€/month)",
            "axis": {
                "titleFontSize": 14,
                "titleColor": "#122620",
                "labelFontSize": 10,
                "format": ",.0f"
            }
        },
        "y": {
            "field": "Bérleti díj (€/hó)",
            "type": "quantitative",
            "title": "Rent (€/month)",
            "axis": {
                "titleFontSize": 14,
                "titleColor": "#122620",
                "labelFontSize": 10,
                "format": ",.0f"
            }
        },
        "color": {
            "field": "Város",
            "type": "nominal",
            "title": "City",
            "legend": {
                "titleFontSize": 12,
                "labelFontSize": 10
            },
            "scale": {
                "range": ["#8b6b4b", "#a27b5c", "#c4a484", "#d4b996", "#e5d5b5"]
            }
        },
        "tooltip": [
            {"field": "Város", "title": "City", "format": ""},
            {"field": "Jövedelem (€/hó)", "title": "Income", "format": ",.0f"},
            {"field": "Bérleti díj (€/hó)", "title": "Rent", "format": ",.0f"},
            {"field": "Korosztály", "title": "Age Group", "format": ""}
        ]
    },
    "config": {
        "view": {"stroke": null},
        "axis": {
            "domain": false,
            "grid": true,
            "gridColor": "#dee2e6",
            "ticks": false
        },
        "background": "transparent"
    }
};

function initializeScatterPlot() {
    // Create filter controls
    const container = document.getElementById('scatter-plot');
    const filterControls = document.createElement('div');
    filterControls.className = 'filter-container';
    filterControls.innerHTML = `
        <div class="filter-row">
            <div class="filter-group">
                <label for="yearFilter">Year:</label>
                <select id="yearFilter" class="filter-select">
                    <option value="all">All Years</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="ageGroupFilter">Age Group:</label>
                <select id="ageGroupFilter" class="filter-select">
                    <option value="all">All Age Groups</option>
                    <option value="18-21">18-21</option>
                    <option value="22-25">22-25</option>
                    <option value="26-29">26-29</option>
                </select>
            </div>
        </div>
    `;
    container.insertBefore(filterControls, container.firstChild);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .filter-row {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 20px;
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
        }
        .filter-group {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;
        }
        .filter-group label {
            color: #122620;
            font-size: 0.9rem;
            font-weight: 500;
            white-space: nowrap;
        }
        .filter-select {
            padding: 6px 12px;
            border-radius: 6px;
            border: 1px solid #D6AD60;
            background-color: white;
            color: #122620;
            font-size: 0.9rem;
            min-width: 150px;
            cursor: pointer;
        }
        .filter-select:hover {
            border-color: #122620;
        }
    `;
    document.head.appendChild(style);

    // Fetch and process data
    fetch('https://raw.githubusercontent.com/Andrea2002-06/Andrea2002-06.github.io/refs/heads/main/europai_lakhatasi_adatbazis.csv')
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split('\n');
            const headers = rows[0].split(',');
            const data = rows.slice(1).map(row => {
                const values = row.split(',');
                const entry = {};
                headers.forEach((header, i) => {
                    entry[header.trim()] = values[i]?.trim();
                });
                return entry;
            });

            // Populate year filter
            const years = [...new Set(data.map(d => d.Év))].sort();
            const yearSelect = document.getElementById('yearFilter');
            years.forEach(year => {
                yearSelect.add(new Option(year, year));
            });

            // Function to update visualization
            function updateVisualization() {
                const year = document.getElementById('yearFilter').value;
                const ageGroup = document.getElementById('ageGroupFilter').value;

                let filteredData = data.filter(d => 
                    (year === 'all' || d.Év === year) &&
                    (ageGroup === 'all' || d.Korosztály === ageGroup)
                );

                scatterPlotSpec.data.values = filteredData;

                vegaEmbed('#scatter-vis', scatterPlotSpec, {
                    theme: "light",
                    actions: {
                        export: true,
                        source: false,
                        compiled: false,
                        editor: false
                    },
                    renderer: "svg"
                });
            }

            // Add event listeners
            document.getElementById('yearFilter').addEventListener('change', updateVisualization);
            document.getElementById('ageGroupFilter').addEventListener('change', updateVisualization);

            // Initial visualization
            updateVisualization();
        })
        .catch(error => console.error('Error loading data:', error));
}

// Initialize the scatter plot when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeScatterPlot); 