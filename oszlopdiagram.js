const csvUrl = "https://raw.githubusercontent.com/Andrea2002-06/Andrea2002-06.github.io/main/europai_lakhatasi_adatbazis.csv";

Plotly.d3.csv(csvUrl, function (data) {
  const filtered = data.filter(d => Number(d["Év"]) % 1 === 0);
  const grouped = {};

  filtered.forEach(row => {
    const év = parseInt(row["Év"]);
    const város = row["Város"];
    const díj = parseFloat(row["Bérleti díj (€/hó)"]);
    const key = `${év}-${város}`;
    if (!grouped[key]) grouped[key] = { év, város, értékek: [] };
    grouped[key].értékek.push(díj);
  });

  const átlagolt = Object.values(grouped).map(e => {
    const átlag = e.értékek.reduce((a, b) => a + b, 0) / e.értékek.length;
    return { év: e.év, város: e.város, dij: átlag };
  });

  const évek = [...new Set(átlagolt.map(d => d.év))].sort((a, b) => a - b);

  const frames = évek.map(ev => {
    const évAdatok = átlagolt
      .filter(d => d.év === ev)
      .sort((a, b) => b.dij - a.dij)
      .slice(0, 10);

    return {
      name: ev.toString(),
      data: [{
        x: évAdatok.map(d => d.dij),
        y: évAdatok.map(d => d.város),
        type: 'bar',
        orientation: 'h',
        marker: { color: 'rgba(0,128,255,0.6)' }
      }]
    };
  });

  const elsőEv = frames[0];
  const layout = {
    title: `Átlagos bérleti díjak városonként – ${évek[0]}`,
    xaxis: {
      title: "Átlagos bérleti díj (€/hó)",
      range: [0, Math.max(...elsőEv.data[0].x) * 1.1]
    },
    yaxis: {
      autorange: 'reversed'
    },
    updatemenus: [{
      type: 'buttons',
      showactive: false,
      buttons: [
        {
          label: 'Lejátszás',
          method: 'animate',
          args: [null, {
            frame: { duration: 1000 },
            transition: { duration: 300 },
            fromcurrent: true
          }]
        },
        {
          label: 'Megállítás',
          method: 'animate',
          args: [[null], {
            mode: 'immediate',
            frame: { duration: 0 },
            transition: { duration: 0 }
          }]
        }
      ]
    }]
  };

  Plotly.newPlot('chart', elsőEv.data, layout).then(() => {
    Plotly.addFrames('chart', frames);
  });
});
