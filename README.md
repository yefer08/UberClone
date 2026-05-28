# ProyectoUberMovil

Aplicacion movil tipo Uber desarrollada con React Native CLI.

## Stack

- React Native CLI
- Redux Toolkit
- React Navigation
- Google Maps APIs (Places, Directions, Distance Matrix)
- Firebase Firestore

## Requisitos

- Node.js 22+
- Android Studio
- Java 17+
- Xcode 16+ (solo iOS en macOS)

## Variables de entorno

Crea el archivo `.env` con este contenido:

```env
GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
GOOGLE_MAPS_WEB_API_KEY=TU_API_KEY_WEB_OPCIONAL
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_WEB_API_KEY=tu-api-key-web-firebase
STRIPE_CHECKOUT_URL=https://buy.stripe.com/test_tu_link
MERCADOPAGO_CHECKOUT_URL=https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=TU_PREFERENCE_ID
```

APIs de Google requeridas:

- Maps SDK for Android
- Places API (New)
- Routes API

## Instalacion y ejecucion

```bash
npm install
npm start
npm run android
```

Para iOS (macOS):

```bash
npm run ios
```

## Verificacion antes de entrega

```bash
npm run lint
npm test -- --watchAll=false
npx tsc --noEmit
```

## Build Android (release)

```bash
cd android
./gradlew assembleRelease
```

APK de salida:

`android/app/build/outputs/apk/release/app-release.apk`

## Funcionalidades principales

- Solicitud de viaje con origen/destino y calculo de ruta.
- Estimacion de distancia, tiempo y tarifa por tipo de vehiculo.
- Seguimiento en tiempo real del conductor (simulado).
- Pago en app: tarjeta, efectivo, Stripe y Mercado Pago.
- Historial de viajes con fecha, estado y costo.
