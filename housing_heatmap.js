const housingHeatmapSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 800,
    "height": 600,
    "data": {
        "url": "https://raw.githubusercontent.com/Andrea2002-06/Andrea2002-06.github.io/refs/heads/main/europai_lakhatasi_adatbazis.csv"
    },
    "transform": [
        {
            "calculate": "datum['Bérleti díj (€/hó)'] / datum['Jövedelem (€/hó)'] * 100",
            "as": "Housing Cost Ratio"
        }
    ],
    "mark": {
        "type": "rect",
        "stroke": "#ffffff",
        "strokeWidth": 1,
        "cursor": "pointer"
    },
    "encoding": {
        "x": {
            "field": "Év",
            "type": "nominal",
            "title": "Year",
            "axis": {
                "labelAngle": 0,
                "titleFontSize": 14,
                "titleColor": "#122620"
            }
        },
        "y": {
            "field": "Város",
            "type": "nominal",
            "title": "City",
            "axis": {
                "titleFontSize": 14,
                "titleColor": "#122620"
            }
        },
        "color": {
            "field": "Housing Cost Ratio",
            "type": "quantitative",
            "title": "Housing Cost Ratio (%)",
            "scale": {
                "scheme": ["#f8f9fa", "#f5f5f5", "#e9ecef", "#d4b996", "#c4a484", "#b38b6d", "#a27b5c", "#8b6b4b", "#6c4a3c"],
                "reverse": true
            },
            "legend": {
                "titleFontSize": 14,
                "titleColor": "#122620",
                "labelFontSize": 12
            }
        },
        "tooltip": [
            {"field": "Város", "type": "nominal", "title": "City"},
            {"field": "Év", "type": "nominal", "title": "Year"},
            {"field": "Housing Cost Ratio", "type": "quantitative", "title": "Housing Cost Ratio (%)", "format": ".1f"},
            {"field": "Bérleti díj (€/hó)", "type": "quantitative", "title": "Rent (€/month)"},
            {"field": "Jövedelem (€/hó)", "type": "quantitative", "title": "Income (€/month)"},
            {"field": "Korosztály", "type": "nominal", "title": "Age Group"},
            {"field": "Ingatlantípus", "type": "nominal", "title": "Property Type"}
        ]
    },
    "selection": {
        "brush": {
            "type": "interval",
            "encodings": ["x", "y"]
        },
        "hover": {
            "type": "single",
            "on": "mouseover",
            "empty": "none"
        }
    },
    "config": {
        "view": {"stroke": null},
        "axis": {
            "domain": false,
            "grid": false,
            "ticks": false
        },
        "background": "transparent"
    }
};

function initializeHousingHeatmap() {
    vegaEmbed('#vis', housingHeatmapSpec, {
        theme: "light",
        actions: {
            export: true,
            source: false,
            compiled: false,
            editor: false
        },
        renderer: "svg"
    }).then(function(result) {
        // Add event listener for age group filter
        document.getElementById('ageGroup').addEventListener('change', function(e) {
            const ageGroup = e.target.value;
            const newSpec = {...housingHeatmapSpec};
            
            if (ageGroup !== 'all') {
                newSpec.transform = [
                    {
                        "filter": `datum['Korosztály'] === '${ageGroup}'`
                    },
                    ...housingHeatmapSpec.transform
                ];
            } else {
                newSpec.transform = housingHeatmapSpec.transform;
            }
            
            vegaEmbed('#vis', newSpec, {
                theme: "light",
                actions: {
                    export: true,
                    source: false,
                    compiled: false,
                    editor: false
                },
                renderer: "svg"
            });
        });

        // Add click event to cells
        result.view.addEventListener('click', function(event, item) {
            if (item && item.datum) {
                const city = item.datum.Város;
                const year = item.datum.Év;
                const ratio = (item.datum['Bérleti díj (€/hó)'] / item.datum['Jövedelem (€/hó)'] * 100).toFixed(1);
                
                // Create a popup with detailed information
                const popup = document.createElement('div');
                popup.className = 'data-popup';
                popup.innerHTML = `
                    <h3>${city} (${year})</h3>
                    <p>Housing Cost Ratio: ${ratio}%</p>
                    <p>Rent: €${item.datum['Bérleti díj (€/hó)']}/month</p>
                    <p>Income: €${item.datum['Jövedelem (€/hó)']}/month</p>
                    <p>Age Group: ${item.datum.Korosztály}</p>
                    <p>Property Type: ${item.datum.Ingatlantípus}</p>
                `;
                
                // Style the popup
                popup.style.cssText = `
                    position: absolute;
                    background: rgba(255, 255, 255, 0.95);
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    z-index: 1000;
                    max-width: 300px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                `;
                
                // Position the popup near the clicked cell
                popup.style.left = event.clientX + 'px';
                popup.style.top = event.clientY + 'px';
                
                // Add to document
                document.body.appendChild(popup);
                
                // Remove popup when clicking elsewhere
                document.addEventListener('click', function removePopup(e) {
                    if (!popup.contains(e.target)) {
                        popup.remove();
                        document.removeEventListener('click', removePopup);
                    }
                });
            }
        });
    });
}

// Initialize the visualization when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeHousingHeatmap); 