import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../types';
import { useAuthStore } from '../store/auth.store';
import { isAdmin as checkIsAdmin } from '../types';

// Screens
import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { AdDetailScreen } from '../screens/ads/AdDetailScreen';
import { CreateAdScreen } from '../screens/ads/CreateAdScreen';
import { MyAdsScreen } from '../screens/ads/MyAdsScreen';
import { TransporterProfileScreen } from '../screens/transporter/TransporterProfileScreen';
import { MyRequestsScreen } from '../screens/requests/MyRequestsScreen';
import { RequestDetailScreen } from '../screens/requests/RequestDetailScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';
import { CancelOrderScreen } from '../screens/orders/CancelOrderScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { ReviewsScreen } from '../screens/reviews/ReviewsScreen';
import { CreateReviewScreen } from '../screens/reviews/CreateReviewScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AdminScreen } from '../screens/admin/AdminScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const isAuthenticated = user !== null;
  const isAdmin = user ? checkIsAdmin(user) : false;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.grey900,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
          contentStyle: { backgroundColor: Colors.scaffoldBackground },
        }}
      >
        {!isInitialized ? (
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
        ) : !isAuthenticated ? (
          // Auth stack
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ title: 'Mot de passe oublié' }}
            />
          </>
        ) : isAdmin ? (
          // Admin stack
          <Stack.Screen
            name="Admin"
            component={AdminScreen}
            options={{ title: 'Qui Go au Bled — Admin' }}
          />
        ) : (
          // Main app stack
          <>
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AdDetail"
              component={AdDetailScreen}
              options={{ title: "Détail de l'annonce" }}
            />
            <Stack.Screen
              name="CreateAd"
              component={CreateAdScreen}
              options={{ title: 'Publier une annonce' }}
            />
            <Stack.Screen
              name="MyAds"
              component={MyAdsScreen}
              options={{ title: 'Mes annonces' }}
            />
            <Stack.Screen
              name="TransporterProfile"
              component={TransporterProfileScreen}
              options={{ title: 'Profil transporteur' }}
            />
            <Stack.Screen
              name="MyRequests"
              component={MyRequestsScreen}
              options={{ title: 'Mes demandes' }}
            />
            <Stack.Screen
              name="RequestDetail"
              component={RequestDetailScreen}
              options={{ title: 'Détail de la demande' }}
            />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{ title: 'Détail du transport' }}
            />
            <Stack.Screen
              name="CancelOrder"
              component={CancelOrderScreen}
              options={{ title: 'Annuler le transport' }}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'Tableau de bord' }}
            />
            <Stack.Screen
              name="Reviews"
              component={ReviewsScreen}
              options={{ title: 'Avis' }}
            />
            <Stack.Screen
              name="CreateReview"
              component={CreateReviewScreen}
              options={{ title: 'Laisser un avis' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: 'Modifier le profil' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Paramètres' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
