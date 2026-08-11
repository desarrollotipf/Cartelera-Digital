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
  if (!d.kpis || d.kpis.length === 0) d.kpis = [
    { id: '1', label: 'SST', value: '120 Días Sin Accidente', icon: '🛡️', color: 'emerald' },
    { id: '2', label: 'Aves en Galpones', value: `40.000 Pollos`, icon: '🐥', color: 'amber' },
    { id: '3', label: 'Cumplimiento Meta Mes', value: '96.4% Calidad', icon: '📈', color: 'blue' }
  ];
  if (!d.hrModule) d.hrModule = [];
  if (!d.hseq) d.hseq = [];
  if (!d.workers) d.workers = [];
  if (!d.events) d.events = [];
  if (!d.videos) d.videos = [];
  if (!d.convenios || d.convenios.length === 0) {
    d.convenios = [
      { id: 'c_1', title: "Gimnasio Bodytech", category: "Salud y Deporte", discount: "15% dto", description: "Descuento en todas las sedes a nivel nacional. Plan trimestre, semestre o año.", color: "#E11D48", image: "/images/bodytech.jpg", details: "Acércate a cualquier sede con tu carnet de afiliado a Compensar y cédula de ciudadanía para hacer efectivo el descuento." },
      { id: 'c_2', title: "Cine Colombia", category: "Entretenimiento", discount: "Tarifas Especiales", description: "Entradas 2D y 3D a precio especial de afiliado. Compra tus boletas directamente en taquilla o web de Compensar.", color: "#8B5CF6", image: "/images/cine-colombia.jpg", details: "Máximo 4 boletas por afiliado al mes. No aplica para preventas o funciones especiales." },
      { id: 'c_3', title: "Agencia de Viajes Compensar", category: "Turismo", discount: "Hasta 20% dto", description: "Paquetes turísticos nacionales e internacionales exclusivos para afiliados.", color: "#0EA5E9", image: "/images/viajes.jpg", details: "Sujeto a disponibilidad de cupos. Válido para el titular de la afiliación y su grupo familiar inscrito." },
      { id: 'c_4', title: "Universidad EAN", category: "Educación", discount: "10% en matrículas", description: "Descuento en programas de pregrado y posgrado en modalidad presencial o virtual.", color: "#10B981", image: "/images/universidad.jpg", details: "Aplica para primer semestre y renovaciones manteniendo un promedio superior a 3.8." },
      { id: 'c_5', title: "Restaurantes Aliados", category: "Gastronomía", discount: "Bonos de $20.000", description: "Adquiere bonos de alimentación con subsidio para restaurantes seleccionados.", color: "#F59E0B", image: "", details: "Válido en Crepes & Waffles, El Corral, y frisby presentando el bono digital." }
    ];
  }
  return d;
};
