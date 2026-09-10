const path = require('path');
const fs = require('fs');
const CarteleraConfig = require('./CarteleraConfig');

// Almacén de datos iniciales para la Cartelera Digital de Pollo Fiesta S.A.
let defaultData = {
  topBar: {
    marquesina: "🐔 POLLO FIESTA S.A. | ¡Comprometidos con la Calidad, Bioseguridad y Bienestar de Nuestros Colaboradores!"
  },
  events: [],
  workers: [],
  farms: [],
  hseq: [],
  hrModule: [],
  videos: [],
  convenios: []
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
      let updated = false;

      // Garantizar que la propiedad videos sea un array y limpiar cualquier video dummy/demo
      if (!Array.isArray(store.videos)) {
        store.videos = [];
        updated = true;
      } else {
        const cleanedVideos = store.videos.filter(v => v?.url && !v.url.includes('mov_bbb.mp4') && !v.url.includes('w3schools'));
        if (cleanedVideos.length !== store.videos.length) {
          store.videos = cleanedVideos;
          updated = true;
        }
      }

      // Patch old database structures to ensure all default modules exist
      const keysToPatch = ['hseq', 'hrModule', 'convenios', 'events'];
      for (const key of keysToPatch) {
        if (!store[key]) {
          store[key] = defaultData[key] || [];
          updated = true;
        }
      }

      if (updated) {
        await CarteleraConfig.update({ data: store }, { where: { id: 1 } });
      }

      return store;
    } catch (error) {
      console.error("Error reading cartelera from Postgres:", error);
      // Fallback a defaultData en caso de error crítico de BD
      return defaultData;
    }
  },

  updateData: async (newData, scope = null) => {
    try {
      let config = await CarteleraConfig.findByPk(1);
      if (!config) {
        config = await CarteleraConfig.create({ id: 1, data: defaultData });
      }

      const currentData = config.data || defaultData;

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

      // Mezcla atómica y compartida según el ámbito del usuario:
      // Gestión Humana y HSEQ comparten la misma cartelera y jamás deben pisarse los datos entre sí
      let mergedData;
      const normalizedScope = (scope || newData.userScope || '').toUpperCase();

      if (normalizedScope === 'HSEQ') {
        // HSEQ solo actualiza normativas HSEQ y sus títulos, preservando intactos los módulos de GH
        mergedData = {
          ...currentData,
          hseq: Array.isArray(newData.hseq) ? newData.hseq : (currentData.hseq || []),
          titles: {
            ...(currentData.titles || {}),
            ...(newData.titles || {})
          }
        };
      } else if (normalizedScope === 'RRHH' || normalizedScope === 'GH') {
        // Gestión Humana actualiza eventos, comunicados GH, videos y convenios, preservando intactas las normas HSEQ
        mergedData = {
          ...currentData,
          ...newData,
          hseq: currentData.hseq || []
        };
      } else {
        // Admin o sincronización completa de fábrica
        mergedData = { ...currentData, ...newData };
      }

      // Guardar en Postgres de forma garantizada
      await CarteleraConfig.update({ data: mergedData }, { where: { id: 1 } });
      config.data = mergedData;
      config.changed('data', true);
      await config.save();

      return mergedData;
    } catch (error) {
      console.error("Error updating cartelera in Postgres:", error);
      throw error;
    }
  }
};
