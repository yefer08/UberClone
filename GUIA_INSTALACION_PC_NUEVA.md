# Guia de Instalacion en PC Nueva (Windows) - ProyectoUberMovil

Objetivo: que cualquier companera pueda clonar y ejecutar el proyecto sin friccion.

## 1. Requisitos obligatorios

Instalar en este orden:

1. Node.js 22 LTS o superior
2. Java JDK 17
3. Android Studio (con Android SDK + platform tools + emulator)
4. Git

Verificar versiones en PowerShell:

```powershell
node -v
npm -v
java -version
git --version
```

## 2. Configuracion Android minima

En Android Studio:

1. Abrir SDK Manager.
2. Instalar una plataforma Android reciente (API 34 o superior).
3. Instalar Android SDK Platform-Tools.
4. Instalar Android SDK Build-Tools.
5. Crear y arrancar un emulador (AVD).

Variables de entorno recomendadas en Windows:

- ANDROID_HOME: ruta del SDK
- Agregar al PATH:
  - %ANDROID_HOME%\\platform-tools
  - %ANDROID_HOME%\\emulator

Ejemplo comun de SDK:

- C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk

Comprobar ADB:

```powershell
adb devices
```

Debe aparecer al menos un dispositivo (emulador o celular USB con depuracion activa).

## 3. Clonar y abrir proyecto

```powershell
git clone https://github.com/yefer08/UberClone.git
cd UberClone
```

Si usan otra carpeta/nombre local no hay problema, solo entrar a la raiz del proyecto.

## 4. Variables de entorno del proyecto

Crear archivo .env en la raiz, copiando .env.example:

```powershell
Copy-Item .env.example .env
```

Luego editar .env con valores reales:

- GOOGLE_MAPS_API_KEY
- GOOGLE_MAPS_WEB_API_KEY
- FIREBASE_PROJECT_ID
- FIREBASE_WEB_API_KEY
- STRIPE_CHECKOUT_URL
- MERCADOPAGO_CHECKOUT_URL

APIs de Google que deben estar habilitadas para la key:

1. Maps SDK for Android
2. Places API (New)
3. Routes API

## 5. Instalar dependencias y correr

Desde la raiz del proyecto:

```powershell
npm install
```

Terminal 1 (Metro):

```powershell
npm start
```

Terminal 2 (Android):

```powershell
npm run android
```

## 6. Verificaciones rapidas (si algo falla)

```powershell
npm run lint
npm test -- --watchAll=false
npx tsc --noEmit
```

Build Android debug manual:

```powershell
cd android
.\\gradlew.bat assembleDebug
```

## 7. Errores comunes y solucion

1. Error: "No emulators found" o "No connected devices"
- Solucion: abrir Android Studio, iniciar AVD y correr adb devices.

2. Error: "SDK location not found"
- Solucion: abrir Android Studio una vez para inicializar SDK y revisar ANDROID_HOME.

3. Error de permisos/API de Google
- Solucion: revisar .env y confirmar APIs habilitadas en Google Cloud.

4. Error de cache Metro
- Solucion:

```powershell
npx react-native start --reset-cache
```

5. Error Gradle raro despues de actualizar dependencias
- Solucion:

```powershell
cd android
.\\gradlew.bat clean
cd ..
npm run android
```

## 8. Flujo recomendado para correr sin problemas

1. Arrancar emulador Android primero.
2. Ejecutar npm start en una terminal.
3. Ejecutar npm run android en otra terminal.
4. Esperar instalacion y apertura automatica de la app.

Con este flujo, el proyecto queda funcionando en una PC nueva de forma estable.
