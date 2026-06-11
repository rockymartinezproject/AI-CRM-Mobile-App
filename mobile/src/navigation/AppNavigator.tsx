import React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LeadsScreen from '../screens/LeadsScreen';
import LeadDetailScreen from '../screens/LeadDetailScreen';
import ContactsScreen from '../screens/ContactsScreen';
import DealsScreen from '../screens/DealsScreen';
import TasksScreen from '../screens/TasksScreen';
import AISearchScreen from '../screens/AISearchScreen';
import ComposeScreen from '../screens/ComposeScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'view-dashboard';
              break;
            case 'Leads':
              iconName = 'account-multiple';
              break;
            case 'Contacts':
              iconName = 'contacts';
              break;
            case 'Deals':
              iconName = 'handshake';
              break;
            case 'Tasks':
              iconName = 'check-circle';
              break;
            default:
              iconName = 'help-circle';
          }
          return <IconButton icon={iconName} size={size} iconColor={color} style={{ margin: 0 }} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Leads" component={LeadsScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Deals" component={DealsScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2563EB' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{
              title: 'AI CRM',
              headerRight: () => (
                <View style={{ flexDirection: 'row' }}>
                  <IconButton
                    icon="information"
                    iconColor="#fff"
                    onPress={() => navigation.navigate('About')}
                  />
                  <IconButton
                    icon="logout"
                    iconColor="#fff"
                    onPress={() => dispatch(logout())}
                  />
                </View>
              ),
            }}
          />
          <Stack.Screen
            name="LeadDetail"
            component={LeadDetailScreen}
            options={{ title: 'Lead Details' }}
          />
          <Stack.Screen
            name="Compose"
            component={ComposeScreen}
            options={{ title: 'AI Composer' }}
          />
          <Stack.Screen
            name="AISearch"
            component={AISearchScreen}
            options={{ title: 'AI Search' }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ title: 'About' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
