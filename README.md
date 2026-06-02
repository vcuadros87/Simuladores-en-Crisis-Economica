# CRISIS.SIM — Simulador de Crisis Económica
---

## Descripción

CRISIS.SIM es una herramienta web educativa y neutral que permite simular y visualizar el impacto de variables económicas en el contexto de una crisis socioeconómica. Mediante modelos matemáticos simples aplicados en el navegador, el usuario puede calcular cómo afectan los precios, el presupuesto y el poder adquisitivo a una familia boliviana.

---

## Estructura del proyecto

```
crisis-sim/
├── index.html
├── README.md
├── CSS/
│   └── style.css
└── JS/
    └── script.js
```

---

## Escenarios disponibles

### 1. Precios de alimentos
Calcula el impacto del aumento de precios en el gasto familiar mensual.

- **Entrada:** nombre del producto, precio anterior, precio actual, cantidad mensual
- **Salida:** gasto anterior, gasto actual, diferencia y porcentaje de aumento por producto y en total
- **Fórmula:** `% aumento = ((precio actual - precio anterior) / precio anterior) × 100`

### 2. Presupuesto familiar
Determina si el presupuesto disponible alcanza para cubrir la lista de compras.

- **Entrada:** presupuesto disponible, lista de productos con precio y cantidad
- **Salida:** total de la compra, saldo restante o monto faltante, clasificación del gasto
- **Fórmula:** `total = Σ (precio unitario × cantidad)`

### 3. Poder adquisitivo
Calcula cuánto poder de compra pierde una familia con el mismo ingreso ante el aumento de precios.

- **Entrada:** ingreso familiar, gasto anterior y actual, precio de canasta básica anterior y actual
- **Salida:** saldo antes y después, porcentaje de pérdida, canastas básicas que se podían y pueden comprar
- **Fórmula:** `% pérdida = ((gasto actual - gasto anterior) / ingreso) × 100`

---

## Sistema de alertas

Cada escenario muestra un banner de estado con interpretación automática:

| Color | Estado | Significado |
|-------|--------|-------------|
| 🟢 Verde | Normal | Situación manejable |
| 🟡 Amarillo | Advertencia | Hay que prestar atención |
| 🔴 Rojo | Crítico | Situación grave |

---

## Tecnologías usadas

- **HTML5** — estructura semántica con secciones, artículos y formularios accesibles
- **CSS** — diseño responsivo Mobile First, variables CSS, Grid, Flexbox, animaciones
- **JavaScript** — lógica de cálculo, manipulación del DOM, validación de entradas

---


## Responsividad

El diseño es Mobile First y se adapta a tres tamaños:

- **Móvil** — base, columna única
- **Tablet** — desde 600px, dos columnas
- **Escritorio** — desde 900px, hasta cuatro columnas

---
## Publicación

- **Página web:** _(completar enlace de GitHub Pages / Netlify / Vercel)_
- **Repositorio Git:** _(completar enlace del repositorio)_

---

## Nota

Este proyecto es una herramienta educativa. No pretende emitir juicios políticos ni económicos. Los datos usados en los casos de estudio son aproximaciones ilustrativas basadas en el contexto boliviano actual.
