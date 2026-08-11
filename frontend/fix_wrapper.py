import os
import re

directory = r'c:\Users\Desarrollo TI\OneDrive - Pollo Fiesta S.A\Escritorio\avisoGestionHumana\frontend\src\pages\Cartelera\modules'

for filename in os.listdir(directory):
    if filename.endswith(".jsx"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove import
        content = re.sub(r'import CanvaElementWrapper[^\n]*\n', '', content)

        # Remove opening tag
        content = re.sub(r'<CanvaElementWrapper[^>]*>', '', content)

        # Remove closing tag
        content = re.sub(r'</CanvaElementWrapper>', '', content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Wrappers removed from all modules")
