# ProyectoUberMovil - README de Estudio Completo

Guia para estudiar y sustentar el proyecto de forma clara, rapida y ordenada.

Objetivo de este documento:
- Entender cada carpeta y archivo importante.
- Saber por que se hizo cada parte.
- Saber que pasa si falta un archivo.
- Tener un guion de exposicion y pruebas finales antes de subir el proyecto.

## 1. Que es este proyecto

Aplicacion movil tipo Uber hecha con:
- React Native CLI
- Redux Toolkit
- React Navigation
- Google Maps APIs (Places + Routes)
- i18n (ES/EN)
- Persistencia local (AsyncStorage)
- Integracion de pagos (tarjeta, efectivo, Stripe, Mercado Pago)

## 2. Orden real en que se construyo (para explicar manana)

1. Base del proyecto y arranque de app.
- Se levanto la estructura React Native y el flujo de navegacion inicial.
- Por que primero: sin esto no hay app corriendo para probar nada.

2. Pantalla Home con ubicacion y mapa.
- Permisos, GPS, mapa y busqueda de destino.
- Por que despues: es el punto de entrada del viaje.

3. Servicios de Google.
- Autocomplete, Place Details, ruta, distancia y ETA.
- Por que: para convertir una busqueda en un viaje real con datos.

4. RideOptions + tarifas.
- Tipos de vehiculo y costo segun distancia.
- Por que: regla de negocio principal del viaje.

5. Perfil + validaciones + idioma.
- Datos de usuario, validaciones y cambio ES/EN.
- Por que: requisito funcional y de UX.

6. Historial de viajes/solicitudes.
- Guardado y lectura de viajes con estado, costo y fecha.
- Por que: trazabilidad del flujo completo.

7. Seguimiento en tiempo real del conductor.
- Marcador animado sobre la ruta.
- Por que: requisito visual clave del proyecto.

8. Pagos.
- Tarjeta, efectivo, Stripe y Mercado Pago (checkout URL).
- Por que: cierre del ciclo del viaje.

9. Pulido UI + validaciones + pruebas.
- Lint, tests, type-check y ajustes visuales.
- Por que: entrega limpia y defendible.

## 3. Estructura del proyecto (carpetas)

### 3.1 src/
Que contiene:
- Toda la logica funcional de la app.

Importancia:
- Es el nucleo del proyecto.

Si falta:
- La app no puede funcionar.

Subcarpetas clave:

1. src/screens/
Que contiene:
- Pantallas visibles del usuario.
- HomeScreen, RideOptionsScreen, ProfileScreen, TripHistoryScreen.

Para que sirve:
- Implementa la UI y el flujo de uso.

Si falta:
- No hay interfaz para interactuar.

2. src/navigation/
Que contiene:
- AppNavigator.js (Stack + Tabs).

Para que sirve:
- Moverse entre pantallas.

Si falta:
- La app no puede navegar.

3. src/store/
Que contiene:
- Store Redux y slices.

Para que sirve:
- Compartir estado entre pantallas (viaje, usuario, historial).

Si falta:
- Se pierde el estado global, errores de flujo y datos inconsistentes.

4. src/store/slices/
Que contiene:
- rideSlice.js
- userSlice.js
- tripHistorySlice.js

Para que sirve:
- Reglas de estado por dominio.

Si falta:
- No hay origen/destino persistente, ni usuario, ni historial.

5. src/utils/
Que contiene:
- Servicios de Google APIs.
- Persistencia local y Firebase.

Para que sirve:
- Conectar con APIs externas y almacenamiento.

Si falta:
- No hay rutas reales, ni historial guardado, ni actualizaciones remotas.

6. src/i18n/
Que contiene:
- Config i18next y traducciones ES/EN.

Para que sirve:
- Internacionalizacion.

Si falta:
- Textos fijos y no se cumple requisito de idioma.

### 3.2 android/
Que contiene:
- Configuracion nativa Android, Gradle, manifiesto y build.

Importancia:
- Necesario para compilar e instalar la app en Android.

Si falta:
- No compila Android.

### 3.3 ios/
Que contiene:
- Proyecto nativo iOS.

Importancia:
- Compilacion en iPhone/macOS.

Si falta:
- No compila iOS.

### 3.4 __tests__/
Que contiene:
- Pruebas de smoke base (App.test.tsx).

Importancia:
- Validacion minima automatizada.

Si falta:
- Menor confianza antes de entregar.

## 4. Archivos clave explicados uno por uno

### 4.1 App.tsx
Que hace:
- Punto de entrada.
- Monta Provider (Redux), SafeArea e i18n.

Si no esta:
- La app no arranca.

### 4.2 src/navigation/AppNavigator.js
Que hace:
- Define Tabs (Home, Profile, TripHistory) y Stack (RideOptions).

Si no esta:
- No hay cambio entre pantallas.

### 4.3 src/screens/HomeScreen.js
Que hace:
- Ubicacion actual.
- Busqueda de destino con autocomplete.
- Calculo de ruta y paso a RideOptions.

Por que es importante:
- Inicio del viaje.

Si no esta:
- No se puede crear viaje.

### 4.4 src/screens/RideOptionsScreen.js
Que hace:
- Seleccion de tipo de viaje.
- Tarifa por distancia.
- Solicitud y estados del viaje.
- Seguimiento animado del conductor.
- Pago (card, cash, stripe, mercadopago).

Si no esta:
- No hay confirmacion de servicio ni pago.

### 4.5 src/screens/ProfileScreen.js
Que hace:
- Formulario de perfil con validaciones.
- Foto de perfil (avatar), genero, idioma.

Si no esta:
- No se cumple requisito de perfil/validaciones.

### 4.6 src/screens/TripHistoryScreen.js
Que hace:
- Lista viajes realizados (completed/paid).
- Muestra origen, destino, fecha, costo, estado y pago.

Si no esta:
- No se puede demostrar historial.

### 4.7 src/store/store.js
Que hace:
- Registra reducers globales.

Si no esta:
- Redux no funciona.

### 4.8 src/store/slices/rideSlice.js
Que hace:
- Estado del viaje actual.
- origen, destino, labels, ruta, ETA, distancia, vehiculo, estado.

Si no esta:
- Flujo de viaje roto.

### 4.9 src/store/slices/userSlice.js
Que hace:
- Estado del perfil.

Si no esta:
- Perfil no persistente.

### 4.10 src/store/slices/tripHistorySlice.js
Que hace:
- Alta y actualizacion de historial.

Si no esta:
- Historial no se refleja en UI.

### 4.11 src/utils/googleClient.js
Que hace:
- Cliente base para Places API (New) y Routes API.

Si no esta:
- No hay busqueda ni rutas reales.

### 4.12 src/utils/autocompleteServices.js
Que hace:
- Sugerencias de destino.

Si no esta:
- No hay autocompletado.

### 4.13 src/utils/playDetailServices.js
Que hace:
- Obtiene coordenadas exactas del destino.

Si no esta:
- No se puede trazar ruta al lugar correcto.

### 4.14 src/utils/directionsService.js
Que hace:
- Polyline de ruta.

Si no esta:
- No se dibuja la ruta en mapa.

### 4.15 src/utils/distanceMatrixService.js
Que hace:
- Distancia y ETA.

Si no esta:
- No hay tiempo estimado ni tarifa correcta por km.

### 4.16 src/utils/tripHistoryStorage.js
Que hace:
- Guarda y actualiza historial en AsyncStorage.

Si no esta:
- Pierdes historial local al cerrar app.

### 4.17 src/utils/firebaseTripService.js
Que hace:
- Guarda/carga/actualiza viajes en Firestore via REST.

Si no esta:
- No hay historial en nube.

### 4.18 src/i18n/index.js y src/i18n/locales/*.json
Que hace:
- Config idioma y textos ES/EN.

Si no esta:
- Sin soporte multi-idioma.

### 4.19 .env / .env.example
Que hace:
- Variables de API keys y checkouts.

Si no esta:
- Falla mapa, pagos externos o Firebase.

## 5. Conexion entre capas (explicacion facil)

1. UI (screens) pide accion del usuario.
2. Utils consultan APIs externas.
3. Resultado se guarda en Redux slices.
4. Pantallas leen Redux y muestran datos.
5. Historial se persiste local/Firebase para reutilizar luego.

Resumen corto:
- Screens muestran.
- Utils conectan.
- Redux coordina.
- Storage/Firebase guardan.

## 6. Firebase (seccion para manana)

Variables que necesitas en .env:
- FIREBASE_PROJECT_ID
- FIREBASE_WEB_API_KEY

Pasos:
1. Crear proyecto Firebase.
2. Activar Firestore (Native mode).
3. Configurar reglas demo.
4. Pegar credenciales en .env.
5. Reiniciar app.
6. Crear viaje y validar documento en coleccion trips.

Reglas demo:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 7. Pruebas finales antes de subir proyecto

Ejecutar:

```bash
npm run lint
npm test -- --watchAll=false
npx tsc --noEmit
```

Pruebas manuales minimas:
1. Home:
- Pide permiso de ubicacion.
- Busca destino y sugiere resultados.

2. RideOptions:
- Muestra distancia y ETA.
- Tarifa cambia segun distancia y tipo de vehiculo.
- Solicitud cambia de estado.
- Marker del conductor se anima.

3. Pago:
- Card valida numero, expiry y cvc.
- Cash funciona.
- Stripe/MercadoPago abren URL si esta configurada.

4. Historial:
- Muestra viajes realizados con fecha/costo/estado/pago.
- Debe mostrar nombres de origen/destino, no coordenadas en viajes nuevos.

5. Perfil:
- Valida campos obligatorios.
- Cambia idioma ES/EN.

## 8. Riesgos y respuestas rapidas para sustentacion

Riesgo: No aparece mapa.
- Revisar GOOGLE_MAPS_API_KEY y APIs habilitadas.

Riesgo: No guarda Firebase.
- Revisar Project ID, API Key y reglas.

Riesgo: No instala Android.
- Revisar dispositivo conectado con adb devices.

Riesgo: Historial vacio.
- Verificar que el viaje llegue a completed o paid.

## 9. Comandos utiles

```bash
npm install
npm start -- --reset-cache
npm run android
npm run ios
npm run lint
npm test -- --watchAll=false
npx tsc --noEmit
```

## 10. Cierre rapido para exponer

Frase corta recomendada:
- El proyecto implementa flujo completo tipo Uber: busqueda, ruta, solicitud, seguimiento en tiempo real, pago y historial persistente, con arquitectura modular, estado global en Redux y soporte bilingue ES/EN.
