# 💳 PayControl - Gestión de Deudas Inteligente

PayControl es una aplicación premium para el seguimiento de deudas y préstamos, ahora potenciada con un backend escalable en Supabase.

## 🚀 Características Principales

- **Arquitectura Dual**: Cambia entre datos Mock y Supabase mediante configuración.
- **Gestión Completa**: Registro de deudas, personas y pagos con evidencias.
- **Historial Detallado**: Línea de tiempo de pagos y estados automatizados.
- **Diseño Premium**: Interfaz oscura, ultra-compacta y responsiva.

---

## 🛠️ Configuración Local

### 1. Clonar e Instalar
```bash
git clone <tu-repositorio>
cd app-paycontrol
npm install
```

### 2. Variables de Entorno
Crea un archivo `.env` en la raíz con:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_DATA_PROVIDER=mock # O 'supabase' para integración real
```

### 3. Ejecutar
```bash
npm run dev
```

---

## 🏗️ Configuración de Supabase (Backend)

Sigue estos pasos para preparar tu base de datos:

1.  **Crear Proyecto**: En el dashboard de Supabase, crea un nuevo proyecto.
2.  **Esquema SQL**: Ejecuta el siguiente script en el Editor SQL de Supabase para crear las tablas y políticas de seguridad (RLS):

```sql
-- Ejecuta el script de migración inicial (ver artifacts/schema.sql si existe)
-- ... (Aquí puedes incluir el SQL que generamos)
```

> [!TIP]
> Para producción, asegúrate de configurar correctamente los dominios permitidos en la sección de Autenticación de Supabase.

---

## 🚀 Despliegue a Producción

Esta aplicación está optimizada para ser desplegada en **Vercel** o **Netlify** directamente desde GitHub.

1.  Conecta tu repositorio a tu plataforma de hosting favorita.
2.  Configura las **Build Settings**:
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
3.  Añade las **Variables de Entorno** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DATA_PROVIDER=supabase`) en el panel de control del hosting.
4.  ¡Listo! Cada `git push` a `main` actualizará tu sitio automáticamente.

---

## 📂 Estructura del Proyecto

- `src/services/api.js`: Bridge que gestiona la comunicación con Mock o Supabase.
- `src/App.jsx`: Componente principal que consume el servicio `api`.
- `src/data/mock.js`: Datos locales para desarrollo rápido.
