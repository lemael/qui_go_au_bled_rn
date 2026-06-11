# Qui Go au Bled — React Native

Application React Native identique à l'app Flutter `qui_go_au_bled`, construite avec Expo et TypeScript.

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | [Expo](https://expo.dev) ~51 / React Native 0.74 |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| État global | [Zustand](https://zustand-demo.pmnd.rs/) |
| HTTP | Axios |
| Stockage sécurisé | expo-secure-store (JWT) |
| UI | Composants custom + @expo/vector-icons |
| Gradient | expo-linear-gradient |
| Date picker | react-native-modal-datetime-picker |
| Dates | date-fns (locale fr) |
| TypeScript | Strict mode |

## Structure du projet

```
src/
├── constants/
│   ├── api.ts         # URL base API, constantes
│   └── colors.ts      # Palette de couleurs (identique Flutter)
├── types/
│   └── index.ts       # Types TypeScript (User, TransportAd, Order…)
├── services/          # Appels API
│   ├── api.ts         # Client Axios + gestion token JWT
│   ├── auth.service.ts
│   ├── ads.service.ts
│   ├── orders.service.ts
│   ├── requests.service.ts
│   ├── reviews.service.ts
│   ├── notifications.service.ts
│   └── admin.service.ts
├── store/
│   └── auth.store.ts  # Store Zustand (auth state)
├── navigation/
│   ├── AppNavigator.tsx     # Navigation principale (Stack)
│   └── MainTabNavigator.tsx # Bottom tab bar (5 onglets)
├── components/        # Composants réutilisables
│   ├── AdCard.tsx
│   ├── OrderCard.tsx
│   ├── StarRating.tsx
│   ├── AppButton.tsx
│   ├── AppTextField.tsx
│   ├── EmptyState.tsx
│   └── LoadingOverlay.tsx
├── screens/
│   ├── auth/          # Splash, Login, Register, ResetPassword
│   ├── home/          # HomeScreen
│   ├── search/        # SearchScreen
│   ├── ads/           # AdDetail, CreateAd, MyAds
│   ├── transporter/   # TransporterProfile
│   ├── requests/      # MyRequests, RequestDetail
│   ├── orders/        # MyTransports, OrderDetail, CancelOrder
│   ├── dashboard/     # DashboardScreen
│   ├── reviews/       # Reviews, CreateReview
│   ├── notifications/ # NotificationsScreen
│   ├── profile/       # Profile, EditProfile
│   ├── settings/      # SettingsScreen
│   └── admin/         # AdminScreen
└── utils/
    └── date.ts        # Utilitaires de formatage de dates
```

## Installation

```bash
npm install
```

## Démarrage

```bash
# Émulateur Android
npm run android

# Simulateur iOS
npm run ios

# Web
npm run web
```

## Configuration API

Le fichier `src/constants/api.ts` contient l'URL de base :
- **Développement (émulateur Android)** : `http://10.0.2.2:3000/api`
- **Production** : Modifier `API_BASE_URL` avec l'URL Railway

## Fonctionnalités

- ✅ Authentification (login / register / reset password)
- ✅ Annonces de transport (liste, recherche, détail, création)
- ✅ Demandes de transport (envoi, acceptation, refus)
- ✅ Commandes (suivi, mise à jour statut, annulation)
- ✅ Profil transporteur
- ✅ Tableau de bord (statistiques)
- ✅ Avis (consultation + rédaction)
- ✅ Notifications
- ✅ Profil & édition
- ✅ Paramètres
- ✅ Panel admin (stats, gestion users/annonces)
- ✅ Navigation conditionnelle (admin vs utilisateur)
- ✅ Partage d'annonces
