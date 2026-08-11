const path = require('path');
const fs = require('fs');
const CarteleraConfig = require('./CarteleraConfig');

// Almacén de datos iniciales para la Cartelera Digital de Pollo Fiesta S.A.
let defaultData = {
  topBar: {
    marquesina: "🐔 POLLO FIESTA S.A. | ¡Comprometidos con la Calidad, Bioseguridad y Bienestar de Nuestros Colaboradores! | Recordatorio: Jornada de Bioseguridad el 25 de Julio"
  },
  workers: [
    {
      id: "w1",
      name: "Laura Restrepo",
      role: "Supervisora de Calidad",
      birthdate: "24 de Julio",
      type: "birthday",
      avatarColor: "#E11D48",
      department: "Planta Procesadora"
    },
    {
      id: "w2",
      name: "Carlos Mario López",
      role: "Jefe de Rutas y Logística",
      birthdate: "28 de Julio",
      type: "birthday",
      avatarColor: "#D97706",
      department: "Distribución"
    },
    {
      id: "w3",
      name: "Diana Marcela Gómez",
      role: "Analista de Sanidad Avícola",
      birthdate: "02 de Agosto",
      type: "birthday",
      avatarColor: "#2563EB",
      department: "Granjas"
    },
    {
      id: "w4",
      name: "Jorge Iván Patiño",
      role: "Operador de Despacho",
      birthdate: "Reconocimiento",
      type: "spotlight",
      avatarColor: "#10B981",
      badge: "Empleado Destacado Q2",
      department: "Despachos"
    }
  ],
  farms: [
    {
      id: "f1",
      name: "Granja San Pedro",
      location: "Km 14 Vía Oriente",
      status: "Óptimo",
      birdsCount: 45000,
      temp: "24.5°C",
      humidity: "62%",
      batchAge: "5 Semanas",
      lastCheck: "Hace 10 min"
    },
    {
      id: "f2",
      name: "Granja El Sol",
      location: "Vereda El Carmen",
      status: "Óptimo",
      birdsCount: 38000,
      temp: "25.1°C",
      humidity: "58%",
      batchAge: "3 Semanas",
      lastCheck: "Hace 5 min"
    },
    {
      id: "f3",
      name: "Granja Los Olivos",
      location: "Sector La Palma",
      status: "Desinfección",
      birdsCount: 0,
      temp: "22.0°C",
      humidity: "55%",
      batchAge: "Sanitización",
      lastCheck: "Hace 1 hora"
    },
    {
      id: "f4",
      name: "Granja Santa Ana",
      location: "Km 8 Vía Norte",
      status: "Óptimo",
      birdsCount: 52000,
      temp: "24.0°C",
      humidity: "60%",
      batchAge: "6 Semanas",
      lastCheck: "Hace 15 min"
    }
  ],
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
  hseq: [
    {
      id: "hs_1",
      title: "Uso Obligatorio de Elementos de Protección (EPP)",
      category: "Seguridad",
      desc: "Recuerda portar casco, botas de seguridad y protección auditiva dentro de las áreas operativas.",
      icon: "🛡️",
      type: "warning"
    },
    {
      id: "hs_2",
      title: "Pausas Activas Cada 2 Horas",
      category: "Salud",
      desc: "Evita fatiga muscular y cuida tu postura realizando breves estiramientos durante la jornada laboral.",
      icon: "❤️",
      type: "info"
    },
    {
      id: "hs_3",
      title: "Clasificación de Residuos en Planta",
      category: "Ambiental",
      desc: "Separa adecuadamente plásticos, cartón y residuos orgánicos en los puntos ecológicos marcados.",
      icon: "🌱",
      type: "success"
    }
  ]
};

// Funciones asíncronas para interactuar con la Base de Datos Postgres
module.exports = {
  getData: async () => {
    try {
      let config = await CarteleraConfig.findByPk(1);
      
      // Si no existe, inicializar en BD con defaultData
      if (!config) {
        config = await CarteleraConfig.create({ id: 1, data: defaultData });
      }
      
      let store = config.data || defaultData;
      if (!store.hseq) {
        store.hseq = defaultData.hseq;
        await CarteleraConfig.update({ data: store }, { where: { id: 1 } });
      }
      
      return store;
    } catch (error) {
      console.error("Error reading cartelera from Postgres:", error);
      // Fallback a defaultData en caso de error crítico de BD
      return defaultData;
    }
  },

  updateData: async (newData) => {
    try {
      let config = await CarteleraConfig.findByPk(1);
      if (!config) {
        config = await CarteleraConfig.create({ id: 1, data: defaultData });
      }

      const currentData = config.data;
      
      // Detect removed files to delete them from the uploads folder
      const oldDataStr = JSON.stringify(currentData);
      const newDataStr = JSON.stringify(newData);

      const extractUploads = (str) => {
        const regex = /\/uploads\/[^"'\s\\]+/g;
        const matches = str.match(regex) || [];
        return new Set(matches);
      };

      const oldUploads = extractUploads(oldDataStr);
      const newUploads = extractUploads(newDataStr);

      oldUploads.forEach(fileUrl => {
        if (!newUploads.has(fileUrl)) {
          const fileName = path.basename(fileUrl);
          const filePath = path.join(__dirname, '../../public/uploads', fileName);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log("Deleted unused uploaded file:", filePath);
            } catch (err) {
              console.error("Error deleting unused file:", filePath, err);
            }
          }
        }
      });

      // Guardar en Postgres
      const mergedData = { ...currentData, ...newData };
      config.data = mergedData;
      await config.save();
      
      return mergedData;
    } catch (error) {
      console.error("Error updating cartelera in Postgres:", error);
      throw error;
    }
  }
};
