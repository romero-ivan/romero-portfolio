# Romero Portfolio: Arquitectura de Software y Sistemas Interactivos

Este repositorio contiene el codigo de la plataforma web personal de Ivan Romero, desarrollador generalista y experto en Entornos de Codigo Agente (ACE) y Modelos de Lenguaje (LLMs). La aplicacion ha sido diseñada bajo una estetica premium que fusiona el escepticismo fisico y skeuomorfico clasico de los años 80 con tecnicas avanzadas de renderizado en el navegador, utilizando exclusivamente tecnologias nativas de la web (vanilla HTML, CSS y Javascript) compiladas mediante Vite.

---

## 1. Filosofia de Diseño y Tokens Visuales

El sistema visual huye de los layouts planos contemporaneos para centrarse en una experiencia fisica digital. Para ello, se establece un sistema de tokens en el archivo de estilos:

* **Paleta de Colores:** Basada en tonos ejecutivos oscuros. Se utiliza negro de carbon mineral como fondo, marron caoba para estructurar los elementos solidos y oro mate o bronce satinado para los acentos interactivos y textos estampados.
* **Texturas Materiales:** El contenedor de informacion principal implementa un patron de cuero oscuro simulado mediante filtros de ruido fractal SVG, delimitado por una costura perimetral pespunteada en oro.
* **Iluminacion Especular Reactiva:** Las carcasas de los minidiscs calculan en tiempo real la posicion del cursor del usuario mediante variables CSS locales. Esto desplaza el punto focal de un gradiente radial con reflejo metalico, generando volumen en 3D.

---

## 2. Sistemas Interactivos y Codigo Detallado

### A. Lente de Cristal de Estilo Leica (Magnificación Optica)

El puntero del raton guia una lente de aumento circular que emula las propiedades refractivas del cristal optico de alta precision. Este sistema se compone de dos partes: el mapa de desplazamiento en el documento HTML y el bucle de actualizacion en el archivo de Javascript.

#### Definicion del Filtro SVG (index.html)
Para alterar las coordenadas de los pixeles del fondo se define un filtro de desplazamiento basado en un mapa radial cargado en memoria:

```html
<svg style="position: absolute; width: 0; height: 0;">
  <defs>
    <filter id="water-filter" x="0%" y="0%" width="100%" height="100%">
      <feImage href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'><radialGradient id='g' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='%23808000'/><stop offset='70%' stop-color='%23808000'/><stop offset='100%' stop-color='%23808080'/></radialGradient><circle cx='150' cy='150' r='150' fill='url(%23g)'/></svg>" result="map" x="0%" y="0%" width="100%" height="100%"/>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="25" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
</svg>
```

#### Comportamiento Optico (main.js)
El filtro lee la imagen del gradiente radial SVG codificada en base64. Los canales de color (Rojo y Verde) se traducen en desplazamientos cartesianos (X e Y) sobre la imagen renderizada detras de la lente. Para evitar problemas de rutas relativas al empaquetar con Vite, el estilo que enlaza al filtro se inyecta directamente en linea sobre la lente:

```javascript
waterLens.style.backdropFilter = "url('#water-filter') url('#water-filter') saturate(1.3)";
```

---

### B. Motor de Fisica de Muelle (Spring Physics)

En lugar de utilizar animaciones lineales basadas en curvas bezier estaticas de CSS, el movimiento de apertura del dossier y el balanceo tridimensional de los minidiscs se gestionan mediante ecuaciones diferenciales de segundo orden que simulan un sistema fisico amortiguado de masa y muelle.

El estado del objeto en cada fotograma se calcula mediante la formula de fuerzas de Hooke con amortiguamiento:

$$\text{Aceleracion} = \frac{-\text{Stiffness} \times (\text{Posicion Actual} - \text{Destino}) - \text{Damping} \times \text{Velocidad}}{\text{Masa}}$$

```javascript
let currentY = 0;
let targetY = 0;
let velocityY = 0;

const mass = 1.0;
const stiffness = 120.0;
const damping = 14.0;

function updatePhysics(deltaTime) {
  const force = -stiffness * (currentY - targetY) - damping * velocityY;
  const acceleration = force / mass;
  velocityY += acceleration * deltaTime;
  currentY += velocityY * deltaTime;
}
```

Este algoritmo se ejecuta dentro de un ciclo `requestAnimationFrame` que desacopla la logica del procesador del renderizado grafico, garantizando oscilaciones organicas estables a 60 hercios (fps).

---

### C. Sistema de Acoplamiento Magnetico de Geometria Divisible (Snapping)

Cuando el cursor se aproxima a un boton interactivo, a un enlace de navegacion o a un nodo metodologico, la lente de aumento se desprende del raton y se acopla magneticamente al elemento.

* **Separacion de Objetivos:** El sistema distingue entre el contenedor de activacion fisica (el elemento interactivo en si) y el objetivo de la geometria visual. Por ejemplo, al sobrevolar un nodo metodologico cuadrado, el sistema calcula la colision basandose en el area general, pero deforma la lente adaptandola al circulo interior del nodo (`.droplet-visual`), asegurando un contorno circular limpio en lugar de una mascara rectangular deformada.
* **Control de Legibilidad:** Al acoplarse sobre texto, la refraccion optica puede dificultar la lectura. Para resolver esto, el motor detecta la colision activa e inmediatamente deshabilita el filtro de desplazamiento y el brillo de fondo:
  ```javascript
  waterLens.style.backdropFilter = 'none';
  waterLens.style.background = 'transparent';
  ```
* **Liberacion Elastica:** El usuario puede escapar del acoplamiento alejando el cursor. La distancia limite para romper la fuerza de atraccion (umbral de escape) se calcula de forma proporcional a las dimensiones del elemento acoplado:
  ```javascript
  const threshold = Math.max(120, targetRect.width / 2 + 100);
  ```

---

### D. Dossier Skeuomórfico y Fotos Polaroid Pre-renderizadas

El panel de informacion de los proyectos simula una carpeta de cuero de ejecutivo.

* **Pespunteado Dorado:** Diseñado con un outline discontinuo en oro mate colocado a `-10px` de margen interno sobre el fondo de textura organica.
* **Monospaciado Tecnico:** Los campos de especificaciones se organizan en filas alineadas donde el titulo utiliza una tipografia serif elegante y los valores utilizan una fuente monospaciada limpia que recuerda a una maquina de escribir mecanica.
* **Polaroid sin Latencia:** Las capturas de pantalla de los proyectos se presentan montadas en un marco polaroid off-white con una inclinacion fisica de `-1.8` grados. Para eliminar el retraso de descarga y decodificacion de red al cambiar de proyecto, todas las imagenes se encuentran inyectadas de antemano en el arbol del DOM. El intercambio se realiza de manera inmediata y sincrona alternando la propiedad de visualizacion de bloque:
  ```javascript
  images.forEach((img, idx) => {
    img.style.display = (idx === activeIndex) ? 'block' : 'none';
  });
  ```

---

### E. Prevención de Fugas de Estado en el Boton de Control

El boton de control de la lente esta diseñado como un circulo limpio con una barra diagonal. Si la lente se apaga y se enciende con rapidez y el raton sale inmediatamente del area del boton, existia la posibilidad de que la lente quedara atascada con un diametro diminuto de `38px` (el tamaño del boton).

Para solventar esta situacion, el sistema limpia proactivamente los objetivos de tamaño, escalando la lente a sus valores flotantes nativos en los dos posibles flujos de salida del estado:

```javascript
// Al desactivar por clic
snappedOrb = null;
snappedGeomTarget = null;
targetWidth = 180;
targetHeight = 180;
targetRadius = 90;

// En el bucle de animacion general si no hay colisiones activas
} else {
  targetWidth = 180;
  targetHeight = 180;
  targetRadius = 90;
  waterLens.style.border = defaultBorder;
  waterLens.style.boxShadow = defaultShadow;
}
```

---

## 3. Instrucciones de Compilación y Despliegue

### Requisitos Previos
Es necesario disponer de Node.js instalado en el entorno de desarrollo.

### Instalacion de Dependencias
Descargue los modulos necesarios utilizando el gestor de paquetes de Node:
```bash
npm install
```

### Ejecucion en Servidor de Desarrollo Local
Para inicializar el compilador y abrir el servidor local con recarga en caliente:
```bash
npm run dev
```

### Compilacion de Produccion
Para construir el bundle optimizado y minificado listo para produccion dentro de la carpeta `dist`:
```bash
npm run build
```

### Despliegue en Firebase Hosting
La aplicacion esta vinculada al proyecto de Firebase Hosting. El despliegue de produccion se efectua con la siguiente instruccion:
```bash
npx -y firebase-tools deploy --only hosting
```
URL de Produccion: https://romerodev.web.app
