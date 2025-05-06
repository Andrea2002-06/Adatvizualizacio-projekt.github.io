// Define the base specification for the scatter plot
const scatterPlotSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 700,
    "height": 350,
    "background": "white",
    "padding": 15,
    "mark": {
        "type": "point",
        "filled": true,
        "stroke": "#ffffff",
        "strokeWidth": 1,
        "cursor": "pointer",
        "size": 40
    },
    "encoding": {
        "x": {
            "field": "Jövedelem (€/hó)",
            "type": "quantitative",
            "title": "Jövedelem (€/hó)",
            "axis": {
                "titleFontSize": 14,
                "labelFontSize": 12,
                "format": ",.0f",
                "titleColor": "#122620",
                "gridColor": "#D6AD60",
                "gridOpacity": 0.2
            }
        },
        "y": {
            "field": "Bérleti díj (€/hó)",
            "type": "quantitative",
            "title": "Bérleti díj (€/hó)",
            "axis": {
                "titleFontSize": 14,
                "labelFontSize": 12,
                "format": ",.0f",
                "titleColor": "#122620",
                "gridColor": "#D6AD60",
                "gridOpacity": 0.2
            }
        },
        "color": {
            "field": "Város",
            "type": "nominal",
            "title": "Város",
            "scale": {
                "range": ["#8b6b4b", "#a27b5c", "#c4a484", "#d4b996", "#e5d5b5"]
            },
            "legend": {
                "titleFontSize": 14,
                "labelFontSize": 12,
                "titleColor": "#122620",
                "labelColor": "#122620",
                "orient": "right",
                "offset": 0,
                "symbolSize": 30
            }
        },
        "tooltip": [
            {"field": "Város", "title": "Város"},
            {"field": "Jövedelem (€/hó)", "title": "Jövedelem", "format": ",.0f"},
            {"field": "Bérleti díj (€/hó)", "title": "Bérleti díj", "format": ",.0f"},
            {"field": "Korosztály", "title": "Korosztály"}
        ]
    },
    "config": {
        "axis": {
            "domain": false,
            "grid": true,
            "gridColor": "#D6AD60",
            "gridOpacity": 0.2,
            "ticks": false
        },
        "view": {
            "stroke": null
        },
        "background": "white",
        "title": {
            "color": "#122620",
            "fontSize": 14,
            "fontWeight": 500
        }
    }
};

// Function to update visualization
function updateVisualization() {
    const year = document.getElementById('yearFilter').value;
    const ageGroup = document.getElementById('ageGroupFilter').value;

    fetch('https://raw.githubusercontent.com/Andrea2002-06/Andrea2002-06.github.io/refs/heads/main/europai_lakhatasi_adatbazis.csv')
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split('\n');
            const headers = rows[0].split(',').map(h => h.trim());
            const data = rows.slice(1)
                .filter(row => row.trim() !== '')
                .map(row => {
                    const values = row.split(',').map(v => v.trim());
                    const entry = {};
                    headers.forEach((header, i) => {
                        if (header === 'Jövedelem (€/hó)' || header === 'Bérleti díj (€/hó)') {
                            entry[header] = parseFloat(values[i]) || 0;
                        } else {
                            entry[header] = values[i] || '';
                        }
                    });
                    return entry;
                });

            let filteredData = data.filter(d => {
                const yearMatch = year === 'all' || d.Év === year;
                const ageMatch = ageGroup === 'all' || d.Korosztály === ageGroup;
                return yearMatch && ageMatch;
            });

            const updatedSpec = {
                ...scatterPlotSpec,
                "data": {
                    "values": filteredData
                }
            };

            vegaEmbed('#scatter-vis', updatedSpec, {
                theme: "light",
                actions: false,
                renderer: "svg"
            }).catch(error => {
                console.error('Error updating visualization:', error);
            });
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for filters
    document.getElementById('yearFilter').addEventListener('change', updateVisualization);
    document.getElementById('ageGroupFilter').addEventListener('change', updateVisualization);

    // Initial visualization
    updateVisualization();
}); 
