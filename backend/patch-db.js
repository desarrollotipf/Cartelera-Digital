const { sequelize } = require('./src/config/db');
const CarteleraConfig = require('./src/models/CarteleraConfig');
const defaultData = {
  events: [
    {
      id: "e1",
      title: "Jornada de Vacunación y Bioseguridad",
      date: "25 de Julio - 08:00 AM",
      category: "Bioseguridad",
      desc: "Capacitación obligatoria sobre nuevos protocolos de sanidad en galpones de engorde.",
      priority: "Alta",
      icon: "🛡️"
    },
    {
      id: "e2",
      title: "Auditoría de Certificación ISO 9001",
      date: "30 de Julio - Todo el día",
      category: "Calidad",
      desc: "Revisión general de estándares de manipulación, inocuidad y cadena de frío.",
      priority: "Media",
      icon: "📋"
    },
    {
      id: "e3",
      title: "Celebración Día del Colaborador Avícola",
      date: "05 de Agosto - 12:00 PM",
      category: "Bienestar",
      desc: "Almuerzo especial y actividades de integración para todo el personal de planta y campo.",
      priority: "Normal",
      icon: "🎉"
    },
    {
      id: "e4",
      title: "Meta SST: 120 Días Sin Accidentes",
      date: "En curso",
      category: "Seguridad",
      desc: "¡Felicitaciones al equipo de distribución y planta por mantener cero incidentes laboral!",
      priority: "Destacado",
      icon: "🏆"
    }
  ],
  hrModule: [
    {
      id: "hr_1",
      title: "Actualización Política de Vacaciones",
      type: "general",
      desc: "Recuerda que ahora puedes solicitar tus vacaciones a través del nuevo portal de autogestión de RRHH.",
      icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    },
    {
      id: "hr_2",
      title: "¡Bono de Productividad Q3!",
      type: "alert",
      desc: "Felicitaciones a todos por alcanzar la meta trimestral. El bono será depositado en la próxima quincena.",
      icon: "https://cdn-icons-png.flaticon.com/512/2933/2933116.png"
    }
  ],
  videos: [
    {
      id: "v_1",
      name: "Cultura Pollo Fiesta",
      url: "https://www.w3schools.com/html/mov_bbb.mp4"
    }
  ]
};

async function patchDb() {
  await sequelize.authenticate();
  const config = await CarteleraConfig.findByPk(1);
  if (config) {
    // Clone to ensure Sequelize detects the change
    let data = JSON.parse(JSON.stringify(config.data || {}));
    let updated = false;
    for (const key of ['events', 'hrModule', 'videos']) {
      if (!data[key] || data[key].length === 0) {
        data[key] = defaultData[key];
        updated = true;
      }
    }
    if (updated) {
      await CarteleraConfig.update({ data: data }, { where: { id: 1 } });
      console.log('Database patched successfully!');
    } else {
      console.log('No patching needed.');
    }
  }
  process.exit(0);
}

patchDb().catch(e => {
  console.error(e);
  process.exit(1);
});
