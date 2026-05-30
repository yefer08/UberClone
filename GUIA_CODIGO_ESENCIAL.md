# Guia de Estudio Tecnica Completa - ProyectoUberMovil

Objetivo: tener una guia real para estudiar el proyecto de punta a punta.
Esta version cubre arquitectura, carpetas, archivos importantes, comportamiento esperado,
errores comunes y guion de sustentacion.

## 0) Actualizacion reciente (2026-05-29)

Resumen de cambios aplicados en interfaz y traducciones para mejorar claridad visual y consistencia:

1. Home:
- Se agrego `helperText` debajo del titulo para explicar el flujo de busqueda de destino.
- Se ajustaron margenes y espaciados para mejorar legibilidad.
- Se estandarizo altura minima de botones principales (`minHeight`) para mejor touch target.
- Se agregaron sombras suaves en tarjetas principales para jerarquia visual.

2. Profile:
- Ajustes de espaciado vertical entre titulo y campos.
- Inputs con fondo blanco explicito para contraste consistente.
- Botones (guardar, historial, logout) con altura minima uniforme y centrado vertical.
- Tarjeta de preview con sombra suave para reforzar separacion de contenido.

3. RideOptions:
- Tarjeta de mapa y tarjetas de opciones con sombras ligeras para mejorar diferenciacion.
- Boton confirmar con altura minima uniforme.
- Boton cancelar con fondo rojo suave para mayor affordance de accion destructiva.

4. TripHistory:
- Tarjetas de viaje migradas a fondo blanco con borde/sombra para consistencia con el resto de pantallas.
- Estado vacio ahora tiene contenedor visual (borde + fondo) para mejor comunicacion de ausencia de datos.

5. i18n (ES/EN):
- Nueva clave `home.helperText` en `es.json` y `en.json`.
- Correcciones de textos en espanol (normalizacion ortografica y redaccion).
- Ajuste de terminologia en mensajes de configuracion: "clave API" en lugar de "API key".

Impacto funcional:
- No cambia la logica de negocio principal (flujo de viaje, perfil, historial).
- Mejora UX visual, accesibilidad tactil y claridad de mensajes para sustentacion/demo.

## 1) Vista general del proyecto

Proyecto: app movil tipo Uber en React Native CLI.

Capas principales:

1. UI (screens + navigation)
2. Estado global (Redux Toolkit)
3. Servicios externos (Google APIs + Firebase + storage local)
4. Configuracion nativa (Android/iOS)

Flujo tecnico general:

1. El usuario define destino en Home.
2. Se consultan APIs de Google para detalles, ruta, distancia y ETA.
3. RideOptions calcula tarifa y gestiona estados del viaje.
4. El viaje se guarda en historial (Redux + local/Firebase segun flujo).
5. TripHistory renderiza lista de viajes.
6. Profile mantiene datos del usuario y preferencias (incluye idioma).

## 2) Estructura raiz explicada (que es cada carpeta/archivo)

### 2.1 Archivos de arranque y configuracion

- `App.tsx`: entry principal de la app React Native.
- `index.js`: registra el componente raiz.
- `app.json`: metadata base del proyecto.
- `babel.config.js`: transformacion JS/TS para Metro/Jest.
- `metro.config.js`: bundler de React Native.
- `tsconfig.json`: reglas de TypeScript.
- `jest.config.js`: configuracion de tests.
- `package.json`: scripts, dependencias y versions.
- `package-lock.json`: lockfile para builds reproducibles.
- `.env` y `.env.example`: variables sensibles y plantilla.
- `.gitignore`: define basura/artefactos que no se suben.

### 2.2 Carpetas de plataforma

- `android/`: proyecto nativo Android (Gradle, manifest, compilacion APK).
- `ios/`: proyecto nativo iOS (Xcode, Info.plist, AppDelegate).

### 2.3 Carpetas de aplicacion

- `src/`: toda la logica funcional de negocio.
- `__tests__/`: pruebas automatizadas (smoke/integracion basica).

### 2.4 Documentacion

- `README.md`: guia operativa para ejecutar/probar app.
- `GUIA_CODIGO_ESENCIAL.md`: guia de estudio tecnico (este archivo).

## 3) Carpeta src/ a detalle (lo mas importante)

## 3.1 `src/navigation/`

Archivo clave:

- `AppNavigator.js`

Responsabilidad:

- Define estructura de navegacion (tabs + stack).
- Controla que pantalla entra en cada flujo.

Comportamiento esperado:

- Home, Profile y TripHistory deben estar accesibles por tabs.
- RideOptions debe abrir desde Home como paso del flujo de viaje.

Si falla:

- Rutas no encontradas.
- Error de componente undefined.
- App puede iniciar pero no navegar.

## 3.2 `src/screens/`

Pantallas principales:

- `HomeScreen.js`
- `RideOptionsScreen.js`
- `ProfileScreen.js`
- `TripHistoryScreen.js`

### HomeScreen.js

Que hace:

- Obtiene ubicacion actual.
- Muestra mapa y origen.
- Busca destino por autocomplete.
- Dispara calculo de ruta/distancia y navega a RideOptions.

Como se comporta:

- Si hay permisos de ubicacion, centra mapa en posicion real.
- Si no hay permisos o coordenadas invalidas, debe usar fallback seguro.

### RideOptionsScreen.js

Que hace:

- Muestra tipos de viaje (Economico/XL/Premium).
- Calcula tarifa estimada con distancia/ETA.
- Simula/gestiona estado de viaje.
- Integra metodos de pago (cash/card/stripe/mercadopago).

Como se comporta:

- No debe permitir confirmar viaje sin origen, destino y ruta validos.
- Debe guardar estado del viaje para historial.

### ProfileScreen.js

Que hace:

- Formulario de perfil: nombre, telefono, genero, email, avatar.
- Validaciones funcionales.
- Cambio de idioma ES/EN.

Como se comporta:

- Rechaza campos vacios o invalidos.
- Mantiene datos en estado global.

### TripHistoryScreen.js

Que hace:

- Lista viajes completados/pagados con fecha, costo y estado.

Como se comporta:

- Si no hay datos, muestra estado vacio claro.
- Si hay datos, renderiza items consistentes con el estado de viajes.

## 3.3 `src/store/`

Archivos:

- `store.js`
- `slices/rideSlice.js`
- `slices/userSlice.js`
- `slices/tripHistorySlice.js`

Responsabilidad:

- Fuente unica de verdad del estado de app.

### store.js

- Registra reducers y habilita dispatch/selectors.

### rideSlice.js

- Estado de viaje activo: origen, destino, ruta, distancia, ETA, vehiculo, status.
- Coordina el flujo Home -> RideOptions.

### userSlice.js

- Estado de usuario y preferencias (perfil/idioma).

### tripHistorySlice.js

- Lista de viajes historicos.
- Alta/actualizacion de registro al completar viaje.

Si store/slices fallan:

- UI puede renderizar, pero datos no sincronizan entre pantallas.
- Acciones no encontradas o estado undefined en runtime.

## 3.4 `src/utils/`

Servicios clave:

- `googleClient.js`: cliente base HTTP para Google APIs.
- `autocompleteServices.js`: sugerencias de destino por texto.
- `playDetailServices.js`: detalle de place (lat/lng, info puntual).
- `directionsService.js`: ruta entre origen y destino.
- `distanceMatrixService.js`: distancia y tiempo estimado.
- `mapsKey.js`: validacion/lectura de key de mapas.
- `firebaseTripService.js`: persistencia remota de viajes.
- `tripHistoryStorage.js`: persistencia local de historial.

Como se comportan:

- Reciben datos de entrada desde screens/slices.
- Llaman servicios externos o storage local.
- Devuelven payload para actualizar Redux y UI.

Fallos comunes:

- API key invalida: fallan rutas, autocomplete o mapas.
- Red lenta/sin internet: timeouts y estados de carga.
- Payload mal formado: excepciones o datos incompletos en pantalla.

## 3.5 `src/i18n/`

Archivos:

- `index.js`: inicializa i18next.
- `locales/es.json` y `locales/en.json`: catalogo de traducciones.

Comportamiento esperado:

- Cambiar idioma desde Profile actualiza textos visibles.
- Si falta una clave, debe caer a fallback sin romper app.

## 4) Carpeta android/ (que debes saber explicar)

Archivos importantes:

- `android/build.gradle`: configuracion global gradle.
- `android/app/build.gradle`: configuracion modulo app y dependencias Android.
- `android/gradle.properties`: flags de build.
- `android/settings.gradle`: modulos del proyecto Android.
- `android/gradlew(.bat)`: wrapper gradle para builds consistentes.

Comportamiento esperado:

- `./gradlew assembleDebug` debe compilar sin error.
- `./gradlew assembleRelease` debe generar APK release.

## 5) Carpeta ios/ (resumen de estudio)

Archivos importantes:

- `ios/Podfile`: dependencias CocoaPods.
- `ios/ProyectoUberMovil/AppDelegate.swift`: arranque nativo iOS.
- `ios/ProyectoUberMovil/Info.plist`: permisos/config iOS.
- `ios/ProyectoUberMovil.xcodeproj/project.pbxproj`: configuracion del proyecto.

Comportamiento esperado:

- Instalar pods y compilar desde Xcode en macOS.

## 6) Criticidad por archivo (si se rompe, que pasa)

Leyenda:

- Critico bloqueante: no arranca app.
- Critico funcional: arranca, pero se rompe el flujo principal.
- Importante: arranca, pero se pierde una capacidad clave.

| Archivo | Criticidad | Impacto si falla |
|---|---|---|
| `App.tsx` | Critico bloqueante | App no monta provider/navegacion |
| `src/navigation/AppNavigator.js` | Critico bloqueante | No hay rutas navegables |
| `src/store/store.js` | Critico bloqueante | Redux no inicializa |
| `src/store/slices/rideSlice.js` | Critico funcional | Viaje no se puede construir correctamente |
| `src/screens/HomeScreen.js` | Critico funcional | No puedes crear solicitud de viaje |
| `src/screens/RideOptionsScreen.js` | Critico funcional | No hay seleccion de viaje/pago/estado |
| `src/screens/ProfileScreen.js` | Importante | Sin validaciones/perfil/idioma |
| `src/screens/TripHistoryScreen.js` | Importante | Sin historial para demostrar cierre de ciclo |
| `src/utils/googleClient.js` | Critico funcional | Cae cadena de servicios Google |
| `src/utils/directionsService.js` | Critico funcional | No hay ruta en mapa |
| `src/utils/distanceMatrixService.js` | Critico funcional | No hay ETA/costo estimado |
| `src/utils/firebaseTripService.js` | Importante | Sin persistencia remota de viajes |

## 7) Flujos que debes dominar para la sustentacion

## 7.1 Flujo de solicitud de viaje

1. Usuario abre Home.
2. Busca destino (autocomplete).
3. Se obtiene detalle de destino (coordenadas).
4. Se calcula ruta + distancia + ETA.
5. Se navega a RideOptions.
6. Usuario elige vehiculo.
7. Se estima costo y se confirma viaje.

## 7.2 Flujo de estado y cierre

1. Viaje pasa por estados (solicitado/en camino/en curso/finalizado/pagado).
2. Al finalizar, se registra en historial.
3. TripHistory consume estado y muestra resumen del viaje.

## 7.3 Flujo de perfil e idioma

1. Usuario edita perfil.
2. Validaciones impiden datos invalidos.
3. Cambio de idioma actualiza textos desde i18n.

## 8) Errores comunes y como explicarlos rapido

1. `Unable to resolve module`: import roto o archivo movido/borrado.
2. Error de navegacion: ruta no registrada en AppNavigator.
3. Estado undefined en Redux: slice no registrado o selector incorrecto.
4. Mapa/ruta no carga: API key o payload de coordenadas invalido.
5. Historial vacio inesperado: no se guardo viaje en slice/storage.

## 9) Checklist de validacion pre-entrega

1. `npm run lint` sin errores.
2. `npm test -- --watchAll=false` en verde.
3. `npx tsc --noEmit` sin errores.
4. `cd android && ./gradlew assembleDebug` exitoso.
5. Flujo manual completo: Home -> RideOptions -> pago -> historial.
6. Perfil valida y cambio de idioma funciona.

## 10) Guion corto de defensa tecnica (45-60 segundos)

"El proyecto usa una arquitectura por capas: pantallas y navegacion para la UI,
Redux Toolkit para estado global, y servicios en utils para Google APIs y persistencia.
El flujo inicia en Home con busqueda de destino, calcula ruta y ETA, pasa a RideOptions
para seleccionar vehiculo, estimar costo y procesar el estado del viaje. Al cerrar,
el viaje se guarda y se visualiza en TripHistory. Profile centraliza validaciones del usuario
y el cambio de idioma ES/EN. Si falla una pieza critica como AppNavigator, store o rideSlice,
se rompe el flujo principal, por eso esas capas son prioridad de prueba y mantenimiento." 
