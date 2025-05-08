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
            "title": "Év",
            "axis": {
                "labelAngle": 0,
                "titleFontSize": 14,
                "titleColor": "#122620"
            }
        },
        "y": {
            "field": "Város",
            "type": "nominal",
            "title": "Város",
            "axis": {
                "titleFontSize": 14,
                "titleColor": "#122620"
            }
        },
        "color": {
            "field": "Housing Cost Ratio",
            "type": "quantitative",
            "title": "Lakhatási költség arány (%)",
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
            {"field": "Város", "type": "nominal", "title": "Város"},
            {"field": "Év", "type": "nominal", "title": "Év"},
            {"field": "Housing Cost Ratio", "type": "quantitative", "title": "Lakhatási költség arány", "format": ".1f"},
            {"field": "Bérleti díj (€/hó)", "type": "quantitative", "title": "Bérleti díj", "format": ",.0f"},
            {"field": "Jövedelem (€/hó)", "type": "quantitative", "title": "Jövedelem", "format": ",.0f"},
            {"field": "Korosztály", "type": "nominal", "title": "Korosztály"},
            {"field": "Ingatlantípus", "type": "nominal", "title": "Ingatlantípus"}
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
        "background": "transparent",
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
        const view = result.view;

        // Add hover effect
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
                const year = item.datum.Év;
                const ratio = (item.datum['Bérleti díj (€/hó)'] / item.datum['Jövedelem (€/hó)'] * 100).toFixed(1);
                const rent = item.datum['Bérleti díj (€/hó)'].toLocaleString();
                const income = item.datum['Jövedelem (€/hó)'].toLocaleString();
                const ageGroup = item.datum.Korosztály;
                const propertyType = item.datum.Ingatlantípus;
                
                tooltip.innerHTML = `
                    <strong style="color: #996835; font-size: 16px;">${city} (${year})</strong><br>
                    <span style="margin-top: 4px; display: inline-block;">Lakhatási költség arány: ${ratio}%</span><br>
                    <span style="margin-top: 4px; display: inline-block;">Bérleti díj: ${rent} €/hó</span><br>
                    <span style="margin-top: 4px; display: inline-block;">Jövedelem: ${income} €/hó</span><br>
                    <span style="margin-top: 4px; display: inline-block;">Korosztály: ${ageGroup}</span><br>
                    <span style="margin-top: 4px; display: inline-block;">Ingatlantípus: ${propertyType}</span>
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

        // Add event listener for age group filter
        document.getElementById('ageGroup').addEventListener('change', function(e) {
            const ageGroup = e.target.value;
            const newSpec = {...housingHeatmapSpec};
            
            if (ageGroup !== 'all') {
                newSpec.transform = [
                    {
                        "filter": `datum['Korosztály'] === '${ageGroup}'`
                    },
                    {
                        "calculate": "datum['Bérleti díj (€/hó)'] / datum['Jövedelem (€/hó)'] * 100",
                        "as": "Housing Cost Ratio"
                    }
                ];
            } else {
                newSpec.transform = [
                    {
                        "calculate": "datum['Bérleti díj (€/hó)'] / datum['Jövedelem (€/hó)'] * 100",
                        "as": "Housing Cost Ratio"
                    }
                ];
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
            }).then(function(result) {
                const view = result.view;

                // Add hover effect
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
                        const year = item.datum.Év;
                        const ratio = (item.datum['Bérleti díj (€/hó)'] / item.datum['Jövedelem (€/hó)'] * 100).toFixed(1);
                        const rent = item.datum['Bérleti díj (€/hó)'].toLocaleString();
                        const income = item.datum['Jövedelem (€/hó)'].toLocaleString();
                        const ageGroup = item.datum.Korosztály;
                        const propertyType = item.datum.Ingatlantípus;
                        
                        tooltip.innerHTML = `
                            <strong style="color: #996835; font-size: 16px;">${city} (${year})</strong><br>
                            <span style="margin-top: 4px; display: inline-block;">Lakhatási költség arány: ${ratio}%</span><br>
                            <span style="margin-top: 4px; display: inline-block;">Bérleti díj: ${rent} €/hó</span><br>
                            <span style="margin-top: 4px; display: inline-block;">Jövedelem: ${income} €/hó</span><br>
                            <span style="margin-top: 4px; display: inline-block;">Korosztály: ${ageGroup}</span><br>
                            <span style="margin-top: 4px; display: inline-block;">Ingatlantípus: ${propertyType}</span>
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
            });
        });
    });
}

// Initialize the visualization when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeHousingHeatmap); 