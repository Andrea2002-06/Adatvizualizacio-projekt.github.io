// CSV fájl beolvasása a GitHubról
const csvUrl = "https://raw.githubusercontent.com/Andrea2002-06/Andrea2002-06.github.io/main/europai_lakhatasi_adatbazis.csv";

Plotly.d3.csv(csvUrl, function (data) {
  // Csak teljes évek és szükséges oszlopok
  const filtered = data.filter(d => Number(d["Év"]) % 1 === 0);

  // Csoportosítás év + város szerint
  const grouped = {};
  filtered.forEach(row => {
    const ev = parseInt(row["Év"]);
    const varos = row["Város"];
    const dij = parseFloat(row["Bérleti díj (€/hó)"]);
    const key = `${ev}-${varos}`;
    if (!grouped[key]) grouped[key] = { év: ev, város: varos, értékek: [] };
    grouped[key].értékek.push(dij);
  });

  // Átlagos bérleti díj számítása
  const átlagAdatok = Object.values(grouped).map(entry => {
    const atlag = entry.értékek.reduce((a, b) => a + b, 0) / entry.értékek.length;
    return { év: entry.év, város: entry.város, dij: atlag };
  });

  // Évek és városok kigyűjtése
  const évek = [...new Set(átlagAdatok.map(d => d.év))].sort((a, b) => a - b);
  const városok = [...new Set(átlagAdatok.map(d => d.város))];

  // Évenkénti frame-ek létrehozása
  const frames = évek.map(ev => {
    const évAdatok = átlagAdatok
      .filter(d => d.év === ev)
      .sort((a, b) => b.dij - a.dij)
      .slice(0, 10); // top 10 város

    return {
      name: ev.toString(),
      data: [{
        x: évAdatok.map(d => d.dij),
        y: évAdatok.map(d => d.város),
        type: 'bar',
        orientation: 'h',
        marker: { color: 'rgba(0, 128, 255, 0.6)' }
      }]
    };
  });

  // Alap grafikon (első év)
  const elsőEv = frames[0];
  const layout = {
    title: `Bérleti díjak (${évek[0]})`,
    xaxis: { title: "Átlagos bérleti díj (€/hó)", range: [0, Math.max(...elsőEv.data[0].x) * 1.1] },
    yaxis: { autorange: 'reversed' },
    updatemenus: [{
      type: 'buttons',
      showactive: false,
      buttons: [{
        label: 'Lejátszás',
        method: 'animate',
        args: [null, { fromcurrent: true, frame: { duration: 1000 }, transition: { duration: 300 } }]
      }, {
        label: 'Megállítás',
        method: 'animate',
        args: [[null], { mode: 'immediate', frame: { duration: 0 }, transition: { duration: 0 } }]
      }]
    }]
  };

  Plotly.newPlot('chart', elsőEv.data, layout).then(() => {
    Plotly.addFrames('chart', frames);
  });
});
