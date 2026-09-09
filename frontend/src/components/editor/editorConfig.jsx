import { Palette, Megaphone, Pin, Shield, Video, Gift } from 'lucide-react';

export const TABS = [
  { id: 'topbar', label: 'Estilo & Header', icon: <Palette size={18} />, step: 0, desc: 'Personaliza la cinta azul #0b4274, títulos principales y opacidad del fondo.' },
  { id: 'events', label: 'Eventos', icon: <Megaphone size={18} />, step: 0, desc: 'Administra comunicados, afiches e información corporativa.' },
  { id: 'hr', label: 'Módulo RRHH', icon: <Pin size={18} />, step: 1, desc: 'Avisos oficiales y boletines de Gestión Humana.' },
  { id: 'hseq', label: 'HSEQ', icon: <Shield size={18} />, step: 3, desc: 'Normas de Salud, Seguridad en el Trabajo, Medio Ambiente y Calidad.', hidden: true },
  { id: 'videos', label: 'Multimedia', icon: <Video size={18} />, step: 5, desc: 'Lista de reproducción y videos corporativos para pantallas TV.' },
  { id: 'convenios', label: 'Convenios', icon: <Gift size={18} />, step: 6, desc: 'Convenios con Compensar y beneficios para empleados.' },
];

export const getDefaultForm = (data) => {
  const d = JSON.parse(JSON.stringify(data || {}));
  if (!d.titles) d.titles = {
    appTitle: 'POLLO FIESTA S.A.',
    appSubtitle: 'Cartelera Digital',
    bdayTitle: 'Cumpleaños!!',
    bdaySubtitle: 'Mes Actual',
    eventsTitle: 'Comunicados y Eventos Corporativos',
    hrTitle: 'Avisos Gestión Humana',
  };
  if (!d.topBar) d.topBar = { marquesina: '', rotationSpeed: 10, moduleOpacity: 0.68 };
  if (d.topBar.moduleOpacity === undefined) d.topBar.moduleOpacity = 0.68;
  if (!d.tabLabels) d.tabLabels = { workers: 'Cumpleaños', events: 'Eventos' };
  if (!d.schema) {
    d.schema = {
      events: [
        { id: 'date', label: 'Fecha', type: 'text', icon: '📅' },
        { id: 'category', label: 'Categoría', type: 'text', icon: '🏷️' },
        { id: 'priority', label: 'Prioridad', type: 'text', icon: '⚠️' }
      ],
      workers: [
        { id: 'role', label: 'Cargo', type: 'text', icon: '💼' },
        { id: 'department', label: 'Departamento', type: 'text', icon: '🏢' },
        { id: 'birthdate', label: 'Fecha / Detalle', type: 'text', icon: '🎈' }
      ]
    };
  }
  if (!d.kpis) d.kpis = [];
  if (!d.hrModule) d.hrModule = [];
  if (!d.hseq) d.hseq = [];
  if (!d.workers) d.workers = [];
  if (!d.events) d.events = [];
  if (!d.videos) d.videos = [];
  if (!d.convenios) d.convenios = [];
  return d;
};
