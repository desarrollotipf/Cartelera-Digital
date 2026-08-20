export function useEditorForm(form, setForm, getDefaultForm, data, onReset) {

  const handleDiscardDraft = () => {
    if (window.confirm("¿Seguro que deseas descartar este borrador?")) {
      localStorage.removeItem('pollo_fiesta_canva_editor_draft');
      setForm(getDefaultForm(data));
    }
  };

  const handleResetFactory = () => {
    if (window.confirm("¿Seguro que deseas restaurar toda la cartelera a los valores de fábrica del sistema?")) {
      localStorage.removeItem('pollo_fiesta_canva_editor_draft');
      onReset();
    }
  };

  const updateTitle = (field, value) => setForm({ ...form, titles: { ...form.titles, [field]: value } });
  
  const updateHr = (index, field, value) => {
    const updated = [...form.hrModule];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, hrModule: updated });
  };
  
  const updateHseq = (index, field, value) => {
    const updated = [...(form.hseq || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, hseq: updated });
  };
  
  const updateWorker = (index, field, value) => {
    const updated = [...form.workers];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, workers: updated });
  };
  
  const updateEvent = (index, field, value) => {
    const updated = [...form.events];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, events: updated });
  };
  
  const updateConvenio = (index, field, value) => {
    const updated = [...(form.convenios || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, convenios: updated });
  };

  const addHrItem = () => setForm({ ...form, hrModule: [...(form.hrModule || []), { id: 'hr_' + Date.now(), title: 'Nuevo Aviso RRHH', desc: 'Detalle de la comunicación', icon: '📌', type: 'info' }] });
  const removeHrItem = (i) => setForm({ ...form, hrModule: form.hrModule.filter((_, idx) => idx !== i) });

  const addHseqItem = () => setForm({ ...form, hseq: [...(form.hseq || []), { id: 'hs_' + Date.now(), title: 'Nuevo Comunicado HSEQ', desc: 'Descripción del protocolo o normativa...', icon: '🛡️', category: 'SST', type: 'warning' }] });
  const removeHseqItem = (i) => setForm({ ...form, hseq: form.hseq.filter((_, idx) => idx !== i) });

  const addWorker = () => setForm({ ...form, workers: [...(form.workers || []), { id: 'w_' + Date.now(), name: 'NUEVO COLABORADOR', role: 'Operario Planta', department: 'Producción', type: 'birthday', birthdate: '15 de Julio', avatarColor: '#0b4274' }] });
  const removeWorker = (i) => setForm({ ...form, workers: form.workers.filter((_, idx) => idx !== i) });

  const addEvent = () => setForm({ ...form, events: [...(form.events || []), { id: 'e_' + Date.now(), title: 'Nuevo Comunicado Corporativo', desc: 'Descripción y alcance del evento.', icon: '📢' }] });
  const removeEvent = (i) => setForm({ ...form, events: form.events.filter((_, idx) => idx !== i) });

  const addConvenio = () => setForm({ ...form, convenios: [...(form.convenios || []), { id: 'c_' + Date.now(), title: 'Nuevo Convenio', category: 'General', discount: '10% dto', description: 'Descripción detallada...', color: '#E11D48', details: '' }] });
  const removeConvenio = (i) => setForm({ ...form, convenios: (form.convenios || []).filter((_, idx) => idx !== i) });

  const removeVideo = (i) => setForm({ ...form, videos: (form.videos || []).filter((_, idx) => idx !== i) });

  const moveItem = (listKey, index, direction) => {
    const updated = [...(form[listKey] || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const [removed] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, removed);
    setForm({ ...form, [listKey]: updated });
  };

  const duplicateItem = (listKey, index, idPrefix = 'item_') => {
    const currentList = form[listKey] || [];
    const original = currentList[index];
    if (!original) return;
    const cloned = JSON.parse(JSON.stringify(original));
    cloned.id = `${idPrefix}${Date.now()}`;
    if (cloned.title) cloned.title = `${cloned.title} (Copia)`;
    if (cloned.name) cloned.name = `${cloned.name} (Copia)`;
    const updated = [...currentList];
    updated.splice(index + 1, 0, cloned);
    setForm({ ...form, [listKey]: updated });
  };

  return {
    handleDiscardDraft,
    handleResetFactory,
    updateTitle,
    updateHr,
    updateHseq,
    updateWorker,
    updateEvent,
    updateConvenio,
    addHrItem,
    removeHrItem,
    addHseqItem,
    removeHseqItem,
    addWorker,
    removeWorker,
    addEvent,
    removeEvent,
    addConvenio,
    removeConvenio,
    removeVideo,
    moveItem,
    duplicateItem
  };
}
