document.addEventListener("DOMContentLoaded", function () {
    // Load and parse CSV
    Papa.parse("https://raw.githubusercontent.com/Andrea2002-06/Andrea2002-06.github.io/refs/heads/main/europai_lakhatasi_adatbazis.csv", {
        download: true,
        header: true,
        complete: function (results) {
            const raw = results.data;
            
            // Get unique housing types and age groups from the data
            const uniqueHousingTypes = [...new Set(raw.map(row => row["Ingatlantípus"]).filter(Boolean))].sort();
            const uniqueAgeGroups = [...new Set(raw.map(row => row["Korosztály"]).filter(Boolean))].sort();
            
            // Initialize data structure
            const processedData = {};
            uniqueHousingTypes.forEach(type => {
                processedData[type] = {};
                uniqueAgeGroups.forEach(age => {
                    processedData[type][age] = [];
                });
            });

            // Process raw data
            raw.forEach(row => {
                const type = row["Ingatlantípus"];
                const ageGroup = row["Korosztály"];
                const size = parseFloat(row["Lakásméret (m²)"]);

                if (type && ageGroup && !isNaN(size)) {
                    if (processedData[type] && processedData[type][ageGroup]) {
                        processedData[type][ageGroup].push(size);
                    }
                }
            });

            // Calculate averages
            const averages = uniqueHousingTypes.map(type => 
                uniqueAgeGroups.map(ageGroup => {
                    const sizes = processedData[type][ageGroup];
                    return sizes.length > 0 
                        ? sizes.reduce((a, b) => a + b, 0) / sizes.length 
                        : 0;
                })
            );

            // Create traces for each age group
            const traces = uniqueAgeGroups.map((ageGroup, ageIndex) => ({
                name: ageGroup,
                type: 'bar',
                x: uniqueHousingTypes,
                y: averages.map(typeData => typeData[ageIndex]),
                text: averages.map(typeData => Math.round(typeData[ageIndex]) + ' m²'),
                textposition: 'auto',
                hoverinfo: 'x+y+name',
                marker: {
                    color: ['#997035', '#b38b6d', '#ccbca7', '#ede3d5', '#f5e6d3', '#d6ad60', '#8a6430', '#7c8558'][ageIndex % 8],
                    line: {
                        color: '#ffffff',
                        width: 1
                    }
                }
            }));

            // Layout configuration
            const layout = {
                title: {
                    text: 'Átlagos lakásméret ingatlantípusonként és korcsoportonként',
                    font: {
                        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        size: 20,
                        color: '#122620'
                    }
                },
                barmode: 'group',
                bargap: 0.15,
                bargroupgap: 0.1,
                xaxis: {
                    title: {
                        text: 'Ingatlantípus',
                        font: {
                            family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                            size: 14,
                            color: '#122620'
                        }
                    },
                    tickfont: {
                        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        size: 12,
                        color: '#122620'
                    }
                },
                yaxis: {
                    title: {
                        text: 'Átlagos lakásméret (m²)',
                        font: {
                            family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                            size: 14,
                            color: '#122620'
                        }
                    },
                    tickfont: {
                        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        size: 12,
                        color: '#122620'
                    }
                },
                legend: {
                    title: {
                        text: 'Korcsoport',
                        font: {
                            family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                            size: 14,
                            color: '#122620'
                        }
                    },
                    font: {
                        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        size: 12,
                        color: '#122620'
                    }
                },
                plot_bgcolor: '#ffffff',
                paper_bgcolor: '#ffffff',
                margin: {
                    l: 60,
                    r: 30,
                    b: 80,
                    t: 80,
                    pad: 4
                },
                showlegend: true,
                legend: {
                    x: 0,
                    y: 1.1,
                    orientation: 'h'
                }
            };

            // Configuration options
            const config = {
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                toImageButtonOptions: {
                    format: 'png',
                    filename: 'ingatlantipusok_lakasmeret',
                    height: 600,
                    width: 1000,
                    scale: 2
                }
            };

            // Create the plot
            Plotly.newPlot('housing-types-chart', traces, layout, config);

            // Add window resize handler
            window.addEventListener('resize', function() {
                Plotly.Plots.resize('housing-types-chart');
            });
        }
    });
}); 