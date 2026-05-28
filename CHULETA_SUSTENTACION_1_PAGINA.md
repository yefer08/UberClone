# Chuleta de Sustentacion (1 Pagina) - ProyectoUberMovil

## 1. Que es el proyecto (20 segundos)

App movil tipo Uber en React Native CLI.
Arquitectura por capas:
1. UI: screens + navigation
2. Estado global: Redux Toolkit
3. Servicios: Google APIs + Firebase + storage local
4. Nativo: Android/iOS

## 2. Flujo principal que debo explicar (60 segundos)

1. Home:
- Obtiene ubicacion actual.
- Busca destino con Google Places Autocomplete.

2. Servicios Google:
- Place Details: coordenadas del destino.
- Directions: ruta.
- Distance Matrix: distancia y ETA.

3. RideOptions:
- Seleccion de vehiculo (Economico/XL/Premium).
- Estimacion de tarifa.
- Estado del viaje (solicitado -> en camino -> en curso -> finalizado -> pagado).
- Metodos de pago: efectivo, tarjeta, Stripe, Mercado Pago.

4. Cierre:
- Se guarda en historial.
- TripHistory muestra fecha, costo, estado y metodo de pago.

## 3. Archivos mas importantes (si me preguntan "donde esta")

- App raiz: App.tsx
- Navegacion: src/navigation/AppNavigator.js
- Estado global: src/store/store.js
- Slices: src/store/slices/rideSlice.js, src/store/slices/userSlice.js, src/store/slices/tripHistorySlice.js
- Pantallas: src/screens/HomeScreen.js, src/screens/RideOptionsScreen.js, src/screens/ProfileScreen.js, src/screens/TripHistoryScreen.js
- Servicios: src/utils/googleClient.js, src/utils/autocompleteServices.js, src/utils/playDetailServices.js, src/utils/directionsService.js, src/utils/distanceMatrixService.js, src/utils/firebaseTripService.js
- Idioma: src/i18n/index.js, src/i18n/locales/es.json, src/i18n/locales/en.json

## 4. Que pasa si se rompe X (respuestas rapidas)

- AppNavigator: la app abre pero no navega.
- store/slices: pantallas sin datos compartidos, estado inconsistente.
- HomeScreen: no inicia solicitud de viaje.
- RideOptions: no se puede confirmar viaje/pago.
- Servicios Google: sin ruta, sin ETA o sin autocomplete.
- i18n: textos sin traducir o fallback.

## 5. Validaciones que ya pase (importante decirlo)

- npm run lint: OK
- npm test -- --watchAll=false: OK
- npx tsc --noEmit: OK
- cd android && ./gradlew assembleDebug: OK

## 6. 5 preguntas tipicas + respuesta corta

1. Por que Redux?
Porque Home, RideOptions, Profile e Historial comparten estado y Redux evita pasar props en cadena.

2. Por que separar utils?
Para aislar la logica de APIs/servicios y mantener pantallas limpias.

3. Como manejas errores de API?
Con validacion de payload, manejo de estados de carga/error y fallbacks en UI.

4. Como garantizas calidad?
Lint + tests + type-check + build Android antes de entregar.

5. Que mejorarias despues?
Mas tests de integracion, manejo offline y endurecer reglas de seguridad Firebase.

## 7. Guion final memorizable (30-40 segundos)

El proyecto separa interfaz, estado y servicios. Home captura origen y destino, consulta Google APIs para ruta, distancia y tiempo, y RideOptions permite elegir tipo de viaje, estimar costo y gestionar el estado hasta finalizar y pagar. Redux centraliza el estado para que Profile e Historial se mantengan consistentes. Ademas, se soporta i18n ES/EN y se valido la entrega con lint, tests, type-check y build Android exitoso.
