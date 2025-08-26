# Karindroid Community Website

Una página web completa para la comunidad de Karindroid con sistema de sorteos integrado para items de Roblox.

## Características

- **Página de inicio** con enlaces a redes sociales
- **Sistema de sorteos** para Brainrots de Roblox
- **Panel de administración** oculto para gestionar sorteos
- **Diseño responsivo** para PC y móviles
- **Integración con GitHub API** para almacenamiento de datos

## Configuración

1. **Configurar GitHub Token:**
   - Ve a GitHub Settings > Developer settings > Personal access tokens
   - Crea un token con permisos de `repo`
   - Edita `script.js` y reemplaza:
     - `YOUR_GITHUB_USERNAME` con tu nombre de usuario
     - `YOUR_REPO_NAME` con el nombre de tu repositorio
     - `YOUR_GITHUB_TOKEN` con tu token

2. **Personalizar enlaces:**
   - Edita `index.html` para agregar tus enlaces reales de redes sociales
   - Actualiza la información de contacto

3. **Desplegar en GitHub Pages:**
   - Sube todos los archivos a tu repositorio
   - Ve a Settings > Pages
   - Selecciona la rama `main` como source

## Uso

### Para usuarios:
- Visita `sorteos.html` para ver sorteos activos
- Haz clic en "Participar" para registrarte con tu username de Roblox
- Solo se requiere el nombre de usuario de Roblox para participar

### Para administradores:
- Accede directamente a `admin.html` (enlace oculto)
- **Agregar Sorteo:** Crea nuevos sorteos con imagen, nombre y fecha
- **Gestionar Sorteos:** Ve todos los sorteos y elimínalos si es necesario
- **Realizar Sorteo:** Selecciona ganadores aleatoriamente de sorteos finalizados

## Estructura de archivos

- `index.html` - Página principal
- `sorteos.html` - Lista de sorteos activos
- `participar.html` - Formulario de participación
- `admin.html` - Panel de administración (oculto)
- `styles.css` - Estilos CSS responsivos
- `script.js` - Funciones principales y configuración de GitHub API
- `giveaways.js` - Lógica de sorteos para usuarios
- `participate.js` - Lógica de participación
- `admin.js` - Lógica del panel de administración
- `data/giveaways.json` - Datos de sorteos
- `data/participants.json` - Datos de participantes

## Tecnologías utilizadas

- HTML5, CSS3, JavaScript (Vanilla)
- GitHub API para almacenamiento
- Font Awesome para iconos
- Diseño responsivo con CSS Grid y Flexbox

## Notas importantes

- El panel de administración está completamente oculto de la navegación
- Los datos se almacenan en archivos JSON en el repositorio
- El sistema verifica automáticamente si los sorteos han finalizado
- Los usuarios solo pueden participar una vez por sorteo
