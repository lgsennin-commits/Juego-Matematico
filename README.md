# Juego Matemático

Juego Matemático es un proyecto web educativo y divertido hecho en HTML/CSS/JavaScript. Incluye dos minijuegos: un modo de etapas con operaciones aritméticas y un modo de "Serpientes y Escaleras" con mecánica de ejercicios y dados.

## 🧩 Estructura del proyecto

- `index.html` - Interfaz de usuario y elementos visuales.
- `styles.css` - Estilos y animaciones.
- `script.js` - Lógica de juego completa.
- `manifest.json` - PWA metadata.
- `sw.js` - Service worker para modo offline (si aplica).

## 🎮 Modo de juego

### 1. Etapas (Juego 1)

- Selecciona el modo desde el menú.
- Resuelve 5 operaciones correctas por etapa.
- Avanza de etapa incrementando la dificultad.
- Operaciones: suma (+), resta (-), multiplicación (x), división (/).
- Feedback instantáneo: correcto o incorrecto.

### 2. Serpientes y Escaleras (Juego 2)

- Elige cantidad de jugadores (1 a 4).
- Cada turno responde una operación para lanzar el dado.
- Si aciertas, tiras el dado y avanzas; si fallas, pierdes el turno.
- Llegar a la casilla 50 para ganar.
- Hay serpientes y escaleras definidas en `boardMap`.

## 🚀 Cómo ejecutar

1. Abrir `index.html` en un navegador moderno.
2. O servir con servidor local:
   - `python -m http.server 8000` (desde carpeta del proyecto)
   - Abrir `http://localhost:8000`

## 🛠️ Detalles técnicos

- Funciones principales en `script.js`:
  - `showScreen()` - cambia pantalla activa.
  - `genMath(difficulty)` - genera problema según dificultad.
  - `g1Gen()` / `g1Check()` - lógica de juego de etapas.
  - `g2GenProblem()` / `g2Check()` / `doDiceRoll()` - lógica de serpientes y escaleras.
- PWA:
  - `manifest.json` listo para instalación.
  - `sw.js` para cache y offline (si se habilita).

## 💡 Ideas de mejoras

- Agregar contador de tiempo por pregunta.
- Guardar puntuaciones usando `localStorage`.
- Incluir más tipos de operaciones (potencias, raíces).
- Sonidos para aciertos/fallos.

## 📄 Licencia

Proyecto libre para uso educativo y personal.
