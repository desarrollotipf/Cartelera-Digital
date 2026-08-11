import os
import re

cartelera_path = 'c:/Users/Desarrollo TI/OneDrive - Pollo Fiesta S.A/Escritorio/avisoGestionHumana/frontend/src/pages/CarteleraPage.jsx'
with open(cartelera_path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('Vista Previa en Expansión (Edición en Vivo)', 'Vista Previa en Expansión')
c = c.replace('televisor en vivo', 'televisor')
c = c.replace('ABRIR CANVA STUDIO EN VIVO', 'ABRIR CANVA STUDIO')
c = re.sub(r'<span className="live-pill">.*?</span>', '', c)
c = c.replace('Experiencia Cinemática 60 FPS', 'Experiencia Cinemática')

with open(cartelera_path, 'w', encoding='utf-8') as f:
    f.write(c)

editor_path = 'c:/Users/Desarrollo TI/OneDrive - Pollo Fiesta S.A/Escritorio/avisoGestionHumana/frontend/src/components/CanvaEditorStudio.jsx'
with open(editor_path, 'r', encoding='utf-8') as f:
    e = f.read()

e = re.sub(r'<span className="canva-live-badge".*?>.*?60 FPS LIVE SYNC.*?</span>', '', e)
e = e.replace('Guardar y Publicar en Vivo', 'Guardar y Publicar')
e = e.replace('Previsualización en Vivo — TV 16:9 · 60 FPS', 'Previsualización — TV 16:9')
e = e.replace('sin pausas (60 FPS).', 'sin pausas.')

with open(editor_path, 'w', encoding='utf-8') as f:
    f.write(e)
