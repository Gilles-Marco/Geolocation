# Geolocation

Projet individuel pour [JMC Nice](https://juniormiageconcept.com/)

Projet React-Native avec la géolocation.

Le but étant d'entrer dans le programme des locations pour lesquels vous serez detecté si vous passez à côté.

# Setup

Le projet a été testé uniquement sur Android, je ne sais pas comment il va réagir sur iOS ou en version web.

Et je ne connais pas comment l'installer/Ajouter les dépendances sur iOS, tout ce qui sera détaillé sera pour android.

Pour installer les dépendances nécessaires listés dans **package.json**
```
npm install
```

## Ajouter une API KEY pour Gmaps

Aller dans le repertoire **android/app/src/main/AndroidManifest.xml**

Tout en bas se trouve la ligne **meta-data pour com.google.android.geo.API_KEY**

Il faut aller sur Google Developer et obtenir une API Key pour la bibliothèque **"Maps SDK for Android"**

Ensuite **mettre l'API Key obtenue dans la ligne value en dessous**.

## Ajouter des locations

Aller dans le repertoire **Component/MapPointerRessource** dans le fichier location.json
Ajouter une location entre les [ ] qui suivera ce format.
```json
{
  "name":"",
  "latitude":,
  "longitude":,
  "radius":
}
```

## Build une apk qui n'aura pas besoin d'être connecter au serveur pour fonctionner.

### Générer une upload key,

### Aller dans le répertoire

* Window : C:\Program Files\Java\jdkx.x.x_x\bin
* MacOS/Linux : /usr/libexec/java_home

Puis éxécuter la commande suivante : 
```
keytool -genkeypair -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### Configurer les variables Gradle

Placer my-upload-key.keystore dans le répertoire android/app

Editer le fichier **android/gradle.properties**

```
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

### Ajouter la signature de votre configuration dans votre application

Editer le fichier **android/app/build.gradle**

```
...
android {
    ...
    defaultConfig { ... }
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
...
```

### Générer l'APK
```
cd android
./gradlew bundleRelease
```

Vous trouverez dans : **android\app\build\outputs\apk\release**

**app-release.apk** que vous pouvez installer sur votre téléphone

# Known bugs

Les cercles des locations sont un peu plus grand que la zone dans laquelle vous serez detectés.

# Dépendance

* [react-native](https://github.com/facebook/react-native)
* [react-native-maps](https://github.com/react-native-community/react-native-maps)
* [react-native-geolocation-service](https://github.com/Agontuk/react-native-geolocation-service)
