import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { uploadFile, uploadImage, deleteFile, fetchAndStoreVideo } from '../services/api';
import {
  Palette, Megaphone, Pin, Cake, BarChart3, Video, Sparkles, Settings, RefreshCw, Zap, Save, X, Plus, Trash2, ChevronUp, ChevronDown, Copy, Image,
  AlertCircle, Award, Info, User, Camera, Calendar, Tag, Building, Briefcase, Trophy, FileVideo, Shield, HeartPulse, Leaf, Gift, Tv
} from 'lucide-react';
import './CanvaEditorStudio.css';
import { TABS, getDefaultForm } from './editor/editorConfig';
import { useEditorForm } from '../hooks/useEditorForm';
import TopBarPanel from './editor/panels/TopBarPanel';
import EventsPanel from './editor/panels/EventsPanel';
import HrPanel from './editor/panels/HrPanel';
import HseqPanel from './editor/panels/HseqPanel';
import MultimediaPanel from './editor/panels/MultimediaPanel';
import ConveniosPanel from './editor/panels/ConveniosPanel';

export default function CanvaEditorStudio({ data, initialTab = 'topbar', initialStep = 0, singleTabMode = false, onSave, onClose, onReset, renderCanvas }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentPreviewStep, setCurrentPreviewStep] = useState(initialStep);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [scale, setScale] = useState(0.65);
  const viewportRef = useRef(null);
  const itemRefs = useRef({});
  const previousTabRef = useRef(null);

  const [form, setForm] = useState(() => {
    const draft = localStorage.getItem('pollo_fiesta_canva_editor_draft');
    if (draft) {
      try { return JSON.parse(draft); } catch (e) {}
    }
    return getDefaultForm(data);
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    localStorage.setItem('pollo_fiesta_canva_editor_draft', JSON.stringify(form));
  }, [form]);

  // Cerrar modal/vista expandida al presionar ESC y volver a pestaña anterior
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedElementId(prevId => {
          if (prevId && previousTabRef.current) {
            const prevTab = previousTabRef.current;
            previousTabRef.current = null;
            // Delay tab switch so the exit layout animation finishes before the side panel collapses
            setTimeout(() => {
              setActiveTab(prevTab);
              const tabInfo = TABS.find(t => t.id === prevTab);
              if (tabInfo && tabInfo.step !== undefined) {
                setCurrentPreviewStep(tabInfo.step);
              }
            }, 300);
          }
          return null;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sincronizar automáticamente la pestaña con el paso del menú en vivo (FlowingMenu)
  const handleTabChange = (tabId) => {
    previousTabRef.current = null;
    setActiveTab(tabId);
    setSelectedElementId(null);
    const tabInfo = TABS.find(t => t.id === tabId);
    if (tabInfo && tabInfo.step !== undefined) {
      setCurrentPreviewStep(tabInfo.step);
    }
  };

  // Click-to-Edit (Opción A): Desde el lienzo en vivo al panel lateral
  const handleCanvasElementClick = (rawModuleId, elementId) => {
    let moduleId = rawModuleId;
    if (moduleId === 'convenio') moduleId = 'convenios';
    if (moduleId === 'event') moduleId = 'events';
    if (moduleId === 'video') moduleId = 'videos';

    if (activeTab !== moduleId) {
      previousTabRef.current = activeTab;
    }
    setActiveTab(moduleId);
    setSelectedElementId(elementId);
    const tabInfo = TABS.find(t => t.id === moduleId);
    if (tabInfo && tabInfo.step !== undefined) {
      setCurrentPreviewStep(tabInfo.step);
    }
    // Auto scroll y foco en el formulario correspondiente
    setTimeout(() => {
      const refKey = `${moduleId}_${elementId}`;
      const elem = itemRefs.current[refKey];
      if (elem && elem.scrollIntoView) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Cálculo automático del zoom/escala para ajustar 1920x1080 al viewport disponible
  useEffect(() => {
    const handleResize = () => {
      if (viewportRef.current) {
        const { clientWidth, clientHeight } = viewportRef.current;
        // Se redujo el margen para que ocupe más pantalla y se aumentó el límite máximo a 1.5
        const scaleX = (clientWidth - 16) / 1920;
        const scaleY = (clientHeight - 32) / 1080;
        const bestScale = Math.min(scaleX, scaleY, 1.5);
        setScale(Math.max(bestScale, 0.25));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddVideoUrl = async (url) => {
    if (!url || !url.trim()) return;
    setIsUploading(true);
    try {
      // Intentar descargar y optimizar el video en el servidor local para cero restricciones
      const res = await fetchAndStoreVideo(url.trim());
      if (res.success && res.data?.url) {
        setForm(prev => ({
          ...prev,
          videos: [{
            id: 'v_' + Date.now(),
            url: res.data.url,
            name: res.data.name || 'Video Corporativo',
            orientation: res.data.orientation || (url.includes('tiktok.com') || url.includes('/shorts/') ? 'portrait' : 'landscape')
          }, ...(prev.videos || [])]
        }));
        return;
      }
    } catch (err) {
      console.warn('Fallo descarga automática:', err);
    } finally {
      setIsUploading(false);
    }

    if (url.includes('tiktok.com')) {
      alert('TikTok ha bloqueado la inserción web de este video ("overload-protect"). Para reproducirlo en la cartelera sin restricciones, sube el archivo de video (.mp4 / .mov) directamente usando el botón "Subir Archivo".');
      return;
    }

    // Fallback para YouTube o Vimeo
    let name = "Video Enlace Web";
    if (url.includes('youtube.com') || url.includes('youtu.be')) name = "Video YouTube";
    if (url.includes('vimeo.com')) name = "Video Vimeo";
    setForm(prev => ({ ...prev, videos: [{ id: 'v_' + Date.now(), url: url.trim(), name }, ...(prev.videos || [])] }));
  };

  const handleSaveAndPublish = async () => {
    localStorage.removeItem('pollo_fiesta_canva_editor_draft');
    onSave(form);
  };

  const {
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
  } = useEditorForm(form, setForm, getDefaultForm, data, onReset);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      if (res.success && res.data.url) {
        const url = res.data.url;
        setForm(prev => ({ ...prev, videos: [{ id: 'v_' + Date.now(), url, name: file.name }, ...(prev.videos || [])] }));
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error al subir el video: ' + (error.message || 'El servidor rechazó el archivo. Verifica el formato.'));
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleItemImageUpload = async (e, type, index) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadImage(file);
      if (res && res.data && res.data.url) {
        const url = res.data.url;
        if (type === 'event') updateEvent(index, 'image', url);
        if (type === 'worker') updateWorker(index, 'image', url);
        if (type === 'hseq') updateHseq(index, 'image', url);
        if (type === 'convenio') updateConvenio(index, 'image', url);
        if (type === 'hrModule') updateHr(index, 'image', url);
        return;
      }
    } catch (err) {
      console.warn('Fallback a carga local de imagen:', err);
    }

    // Fallback garantizado directo en el navegador con FileReader
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target.result;
        if (type === 'event') updateEvent(index, 'image', url);
        if (type === 'worker') updateWorker(index, 'image', url);
        if (type === 'hseq') updateHseq(index, 'image', url);
        if (type === 'convenio') updateConvenio(index, 'image', url);
        if (type === 'hrModule') updateHr(index, 'image', url);
      };
      reader.readAsDataURL(file);
    } catch (readErr) {
      alert('Error leyendo el archivo: ' + readErr.message);
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const activeTabInfo = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <LayoutGroup id="canva-editor-group">
      <div className="canva-studio-container">
        {/* 1. barra de navegacion superior */}
        <header className="canva-studio-topbar">
          <div className="canva-brand-box">
            <div className="canva-brand-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={28} color="#38bdf8" /></div>
            <h1 className="canva-brand-title">
              POLLO FIESTA — EDITOR
            
          </h1>
        </div>
        <div className="canva-topbar-actions">
          <button 
            className="canva-btn" 
            onClick={() => window.open('/cartelera/tv', '_blank')} 
            title="Abrir la Cartelera Digital en Modo TV en una nueva ventana" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', 
              color: '#fff', 
              border: '1px solid rgba(167, 139, 250, 0.4)', 
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)'
            }}
          >
            <Tv size={16} /> Modo TV
          </button>
          <button className="canva-btn canva-btn-primary" onClick={handleDiscardDraft} title="Descartar borrador no guardado" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} /> Descartar Cambios
          </button>
          <button className="canva-btn canva-btn-primary" onClick={handleResetFactory} title="Volver a configuración de fábrica" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} /> Valores Fábrica
          </button>
          <button className="canva-btn canva-btn-primary" onClick={handleSaveAndPublish} disabled={isUploading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> Guardar y Publicar
          </button>
          <button className="canva-btn canva-btn-close" onClick={onClose} title="Cerrar sin guardar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <X size={16} /> Salir
          </button>
        </div>
      </header>

      {/* 2. BODY SPLIT STUDIO WORKSPACE */}
      <main className="canva-studio-body">
        {/* Dock Lateral Vertical (Pestañas Coherentes) */}
        {!singleTabMode && (
          <nav className="canva-sidebar-dock">
            {TABS.filter(tab => !tab.hidden).map(tab => {
            let count = null;
            if (tab.id === 'events') count = (form.events || []).length;
            if (tab.id === 'hr') count = (form.hrModule || []).length;
            if (tab.id === 'workers') count = (form.workers || []).length;
            if (tab.id === 'hseq') count = (form.hseq || []).length;
            if (tab.id === 'videos') count = (form.videos || []).length;

            return (
              <button
                key={tab.id}
                className={`canva-dock-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                title={tab.desc}
              >
                <span className="canva-dock-icon">{tab.icon}</span>
                <span className="canva-dock-label">{tab.label}</span>
              </button>
            );
          })}
          </nav>
        )}

        {/* Panel Izquierdo de Herramientas Dinámicas (Formulario en Tiempo Real) */}
        <section className="canva-sidebar-panel">
          <div className="canva-panel-header">
            <h3>{activeTabInfo.icon} {activeTabInfo.label}</h3>
            <p>{activeTabInfo.desc}</p>
          </div>

          <div className="canva-panel-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {activeTab === 'topbar' && (
                  <TopBarPanel form={form} setForm={setForm} updateTitle={updateTitle} selectedElementId={selectedElementId} itemRefs={itemRefs} />
                )}

                {activeTab === 'events' && (
                  <EventsPanel form={form} addEvent={addEvent} updateEvent={updateEvent} handleItemImageUpload={handleItemImageUpload} isUploading={isUploading} moveItem={moveItem} duplicateItem={duplicateItem} removeEvent={removeEvent} itemRefs={itemRefs} selectedElementId={selectedElementId} setSelectedElementId={setSelectedElementId} />
                )}

                {activeTab === 'hr' && (
                  <HrPanel form={form} addHrItem={addHrItem} updateHr={updateHr} handleItemImageUpload={handleItemImageUpload} isUploading={isUploading} moveItem={moveItem} duplicateItem={duplicateItem} removeHrItem={removeHrItem} itemRefs={itemRefs} selectedElementId={selectedElementId} setSelectedElementId={setSelectedElementId} />
                )}

                {activeTab === 'hseq' && (
                  <HseqPanel form={form} addHseqItem={addHseqItem} updateHseq={updateHseq} handleItemImageUpload={handleItemImageUpload} isUploading={isUploading} moveItem={moveItem} duplicateItem={duplicateItem} removeHseqItem={removeHseqItem} itemRefs={itemRefs} selectedElementId={selectedElementId} setSelectedElementId={setSelectedElementId} />
                )}

                {activeTab === 'videos' && (
                  <MultimediaPanel form={form} setForm={setForm} handleAddVideoUrl={handleAddVideoUrl} handleVideoUpload={handleVideoUpload} isUploading={isUploading} moveItem={moveItem} removeVideo={removeVideo} itemRefs={itemRefs} selectedElementId={selectedElementId} setSelectedElementId={setSelectedElementId} />
                )}

                {activeTab === 'convenios' && (
                  <ConveniosPanel form={form} addConvenio={addConvenio} updateConvenio={updateConvenio} handleItemImageUpload={handleItemImageUpload} isUploading={isUploading} moveItem={moveItem} duplicateItem={duplicateItem} removeConvenio={removeConvenio} itemRefs={itemRefs} selectedElementId={selectedElementId} setSelectedElementId={setSelectedElementId} />
                )}


              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* 3. LIENZO INTERACTIVO EN VIVO (Studio Canvas Viewport) */}
        <section className="canva-canvas-viewport" ref={viewportRef}>


          {/* Modal eliminado: El usuario quiere editar desde el panel izquierdo y que la tarjeta de la vista previa se expanda visualmente */}

          {/* Wrapper con escala calculada automáticamente al viewport (1920x1080 -> scale) */}
          <div className="canva-canvas-scaler" style={{ transform: `scale(${scale})` }}>
            {renderCanvas ? renderCanvas(form, currentPreviewStep, selectedElementId, handleCanvasElementClick) : null}
          </div>
        </section>
      </main>
    </div>
    </LayoutGroup>
  );
}
