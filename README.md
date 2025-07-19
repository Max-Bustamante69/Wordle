# Wordle Game with Proxy Server

Este proyecto incluye un servidor proxy para resolver problemas de CORS con la API de RAE.

## Instalación

1. Instala las dependencias:

```bash
npm install
```

2. Inicia el servidor proxy:

```bash
npm start
```

O para desarrollo con auto-reload:

```bash
npm run dev
```

## Estructura del Proyecto

- `server.js` - Servidor proxy Express.js que maneja las solicitudes a la API de RAE
- `inputValidator.js` - Validador de entrada que usa el proxy para validar palabras en español
- `config.js` - Configuración para diferentes entornos (desarrollo/producción)

## Cómo Funciona

### Problema de CORS

El error original era:

```
Access to fetch at 'https://rae-api.com/api/words/trufa' from origin 'https://wordle-max.vercel.app' has been blocked by CORS policy
```

### Solución Implementada

1. **Servidor Proxy**: `server.js` actúa como intermediario entre tu aplicación y la API de RAE
2. **Configuración Dinámica**: `config.js` maneja diferentes URLs según el entorno
3. **Fallback**: Si el proxy falla, se usa la lista local de palabras

### Endpoints del Proxy

- `GET /api/rae-proxy/:word` - Valida palabras en español usando la API de RAE
- `GET /api/health` - Verifica el estado del servidor

## Despliegue en Producción

Para usar en producción, necesitas desplegar el servidor proxy en un servicio como:

### Opción 1: Heroku

```bash
# Crear app en Heroku
heroku create your-wordle-proxy

# Desplegar
git push heroku main
```

### Opción 2: Railway

1. Conecta tu repositorio a Railway
2. Railway detectará automáticamente que es una app Node.js

### Opción 3: Vercel (Serverless Functions) - ✅ RECOMENDADO

Ya tienes el archivo `api/rae-proxy.js` creado. Solo necesitas:

1. **Desplegar en Vercel**:

   ```bash
   # Instalar Vercel CLI
   npm i -g vercel

   # Desplegar
   vercel
   ```

2. **O usar GitHub + Vercel**:

   - Conecta tu repositorio a Vercel
   - Vercel detectará automáticamente la función serverless

3. **Actualizar la URL en producción**:
   Una vez desplegado, actualiza `config.js` con tu URL de Vercel:
   ```javascript
   production: {
     proxyUrl: "https://tu-app.vercel.app/api/rae-proxy?word=",
     englishApiUrl: "https://api.dictionaryapi.dev/api/v2/entries/en/"
   }
   ```

## Actualizar Configuración de Producción

Una vez desplegado el proxy, actualiza `config.js`:

```javascript
production: {
  proxyUrl: 'https://tu-proxy-server.herokuapp.com/api/rae-proxy/',
  englishApiUrl: 'https://api.dictionaryapi.dev/api/v2/entries/en/'
}
```

## Desarrollo Local

1. Inicia el servidor proxy: `npm start`
2. Abre tu aplicación en el navegador
3. Las validaciones de palabras en español ahora pasarán por el proxy local

## Pruebas

### Probar el Proxy Local

```bash
# Verificar que el servidor esté corriendo
curl http://localhost:3001/api/health

# Probar una palabra en español
curl http://localhost:3001/api/rae-proxy/casa
```

### Probar el Proxy de Vercel (en producción)

```bash
# Probar una palabra en español
curl "https://wordle-max.vercel.app/api/rae-proxy?word=casa"
```

## Troubleshooting

### Error: "Cannot find module 'node-fetch'"

```bash
npm install node-fetch@2
```

### Error: "Cannot find module 'cors'"

```bash
npm install cors
```

### El proxy no responde

Verifica que el servidor esté corriendo en el puerto 3001:

```bash
curl http://localhost:3001/api/health
```
