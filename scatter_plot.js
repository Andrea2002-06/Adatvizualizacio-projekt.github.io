// Define the base specification for the scatter plot
const scatterPlotSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": 900,
    "height": 500,
    "background": "white",
    "padding": 20,
    "mark": {
        "type": "point",
        "filled": true,
        "stroke": "#ffffff",
        "strokeWidth": 1,
        "cursor": "pointer",
        "size": 80
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
        ],
        "opacity": {
            "condition": {
                "test": "datum === hover",
                "value": 1
            },
            "value": 0.7
        }
    },
    "selection": {
        "hover": {
            "type": "single",
            "on": "mouseover",
            "empty": "none"
        }
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
        },
        "tooltip": {
            "theme": "light",
            "content": "data",
            "style": {
                "fontFamily": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                "fontSize": "14px",
                "padding": "12px",
                "backgroundColor": "rgba(255, 255, 255, 0.95)",
                "borderRadius": "8px",
                "boxShadow": "0 4px 8px rgba(0,0,0,0.15)",
                "border": "1px solid #ddd"
            }
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
            }).then(function(result) {
                const view = result.view;
                
                // Add custom hover effect
                view.addEventListener('mouseover', function(event, item) {
                    if (item && item.datum) {
                        const tooltip = document.createElement('div');
                        tooltip.className = 'custom-tooltip';
                        tooltip.style.position = 'absolute';
                        tooltip.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                        tooltip.style.padding = '12px';
                        tooltip.style.borderRadius = '8px';
                        tooltip.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                        tooltip.style.pointerEvents = 'none';
                        tooltip.style.zIndex = '1000';
                        tooltip.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
                        tooltip.style.fontSize = '14px';
                        tooltip.style.color = '#333';
                        tooltip.style.border = '1px solid #ddd';
                        
                        const city = item.datum.Város;
                        const income = item.datum["Jövedelem (€/hó)"];
                        const rent = item.datum["Bérleti díj (€/hó)"];
                        const ageGroup = item.datum.Korosztály;
                        
                        tooltip.innerHTML = `
                            <strong style="color: #996835; font-size: 16px;">${city}</strong><br>
                            <span style="margin-top: 4px; display: inline-block;">Jövedelem: ${income.toLocaleString()} €/hó</span><br>
                            <span style="margin-top: 4px; display: inline-block;">Bérleti díj: ${rent.toLocaleString()} €/hó</span><br>
                            <span style="margin-top: 4px; display: inline-block;">Korosztály: ${ageGroup}</span>
                        `;
                        
                        document.body.appendChild(tooltip);
                        
                        // Position tooltip near cursor
                        tooltip.style.left = (event.pageX + 15) + 'px';
                        tooltip.style.top = (event.pageY + 15) + 'px';
                    }
                });
                
                view.addEventListener('mouseout', function() {
                    const tooltips = document.getElementsByClassName('custom-tooltip');
                    while(tooltips.length > 0) {
                        tooltips[0].parentNode.removeChild(tooltips[0]);
                    }
                });
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
