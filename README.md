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

1. Configura las variables en `.env`:

```env
GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
GOOGLE_MAPS_WEB_API_KEY=TU_API_KEY_WEB_OPCIONAL
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_WEB_API_KEY=tu-api-key-web-firebase
STRIPE_CHECKOUT_URL=https://buy.stripe.com/test_tu_link
MERCADOPAGO_CHECKOUT_URL=https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=TU_PREFERENCE_ID
```

1. Habilita APIs de Google necesarias para la key:

- Maps SDK for Android
- Places API (New)
- Routes API

## Firebase (resumen)

1. Activa Firestore en modo Native.
2. Crea coleccion `trips`.
3. Para demo academica, puedes usar reglas temporales abiertas.

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

## Funcionalidades implementadas

- Seguimiento en tiempo real del conductor con marcador animado.
- Ciclo completo de viaje: solicitado -> conductor en camino -> en curso -> finalizado -> pagado.
- Pago dentro de la app: tarjeta, efectivo, Stripe y Mercado Pago (checkout URL).
- Historial de viajes realizados con costo, fecha, estado y metodo de pago.

## Guia de estudio

La documentacion completa para estudiar y sustentar esta en:

- `README_ESTUDIO.md`
