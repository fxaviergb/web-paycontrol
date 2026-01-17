# Reglas de diseño – Subscriptions Dashboard

## Objetivo
- Interfaz moderna, premium y muy limpia.
- Prioridad: legibilidad + jerarquía visual + sensación de “producto de pago”.
- Una sola página (sin navegación compleja). Todo debe sentirse rápido.

## Estilo general
- Tema oscuro por defecto. Fondo muy oscuro con ligera variación entre secciones.
- Toques de color solo para estados/acciones (no llenar de colores).
- Componentes consistentes: mismos radios, sombras y espaciados en toda la app.

## Tipografía
- Fuente: Inter (o sistema si no está disponible).
- Títulos: 20–24px, semibold.
- Subtítulos / labels: 12–14px, medium, con opacidad ligera.
- Texto normal: 14–16px, regular.
- Números del dashboard: grandes, claros, con separadores y símbolo €.

## Layout y espaciados
- Grid de 12 columnas (responsive).
- Contenedor max-width 1200px, centrado.
- Espaciado base 8px (8 / 16 / 24 / 32).
- Separación entre secciones: 24–32px.
- Mucho aire: evita bloques apretados.

## Tarjetas (cards)
- Radio: 14–16px.
- Fondo de tarjeta: un tono más claro que el fondo.
- Borde sutil (1px) o sombra muy suave, pero no ambos fuertes.
- Padding interno: 16–20px.
- Títulos de tarjeta arriba a la izquierda; acciones (…) arriba a la derecha si aplica.

## Colores
- Fondo principal: #0B0F17 (o similar).
- Superficie (cards): #111827 (o similar).
- Texto principal: casi blanco (alta legibilidad).
- Texto secundario: gris con opacidad (no demasiado tenue).
- Color de acento (botones / highlights): azul o violeta elegante (uno solo).

## Estados
- Positivo: verde suave.
- Negativo: rojo suave.
- Aviso: ámbar suave.
- Los gráficos deben usar el color de acento + variaciones del mismo (no arcoíris).

## Botones e inputs
- Botón primario: relleno con color de acento, alto 40–44px, radio 12px.
- Botón secundario: borde sutil o fondo ligeramente distinto, sin ruido.
- Inputs: oscuros, borde sutil, focus visible con acento.
- Todo debe ser “teclado-friendly”: tab order lógico, enter para guardar, esc para cerrar.

## Gráficos
- Estilo minimalista: líneas finas, ejes discretos, sin grid agresivo.
- Tooltips claros al pasar el ratón.
