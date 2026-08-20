const fs = require('fs');
const csv = require('csv-parser');

let markdown = `# Reporte de Empleados Elegibles (Junio y Julio)
A continuación se detalla la lista de las personas que pasaron los filtros estrictos y cumplen en los meses de Junio (06) o Julio (07).

| Nombre | Mes Cumple | Centro de Operación (C.O.) | Cargo | Justificación |
|---|---|---|---|---|
`;

let people = [];

fs.createReadStream('src/data/empleados.csv')
  .pipe(csv())
  .on('data', (data) => {
    const estado = (data['Descripcion estado'] || '').trim();
    if (estado.toUpperCase() !== 'ACTIVO') return;
    
    const fechaNac = data['Fecha nacimiento del empleado']; 
    if (!fechaNac) return;
    
    const parts = fechaNac.split('-');
    if (parts.length < 2) return;
    
    const mes = parts[1];
    if (mes !== '06' && mes !== '07') return;
    
    const co = (data['Descripcion C.O.'] || '').trim().toUpperCase();
    
    const isAllowedCO = 
      co.includes('ADMINISTRACION') || 
      co.includes('UND FUNCIONAL ASADERO') || 
      co.includes('ADMINISTR.PARA DISTRIBUIR');
    
    if (isAllowedCO) {
      const areasStr = `${data['Descripcion C.O.']}`;
      people.push({
        name: data['Nombre del empleado'],
        month: parts[1],
        areasStr,
        rol: data['Descripcion del cargo'],
        justificacion: "✅ Pertenece a " + data['Descripcion C.O.']
      });
    }
  })
  .on('end', () => {
    people.sort((a, b) => a.name.localeCompare(b.name));
    for (const p of people) {
      markdown += `| ${p.name} | Mes ${p.month} | ${p.areasStr} | ${p.rol} | ${p.justificacion} |\n`;
    }
    fs.writeFileSync('reporte_cumpleanos.md', markdown);
    console.log("Reporte generado.");
  });
