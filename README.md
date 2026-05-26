# ProyectoUberMovil

Aplicacion movil tipo Uber construida con React Native CLI, Redux Toolkit, React Navigation e integracion con APIs de Google Maps.

## Requisitos

- Node.js 22+
- Android Studio (Android)
- Java 17+
- Xcode 16+ (solo para iOS en macOS)

## Configuracion de entorno

1. Instala dependencias:

```bash
npm install
```

1. Configura la API key en `.env`:

```env
GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
```

1. Habilita APIs de Google necesarias para la key:

- Places API
- Place Details API
- Directions API
- Distance Matrix API

## Comandos de desarrollo

```bash
npm start
npm run android
npm run ios
```

## Validaciones previas a entrega

```bash
npm run lint
npm test -- --watchAll=false
npx tsc --noEmit
```

## Build de entrega Android

```bash
cd android
./gradlew assembleRelease
```

APK generado en:

`android/app/build/outputs/apk/release/app-release.apk`

## Firma release recomendada

Para firma de produccion, define estas propiedades en `android/gradle.properties` (o via `~/.gradle/gradle.properties`):

```properties
MYAPP_UPLOAD_STORE_FILE=nombre-del-keystore.jks
MYAPP_UPLOAD_STORE_PASSWORD=tu_password
MYAPP_UPLOAD_KEY_ALIAS=tu_alias
MYAPP_UPLOAD_KEY_PASSWORD=tu_password_alias
```

Si no estan definidas, el proyecto sigue compilando release con debug keystore para pruebas academicas.
