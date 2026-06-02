// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { Colors } from '../utils/theme';

import HomeScreen from '../screens/HomeScreen';
import SelectClassScreen from '../screens/SelectClassScreen';
import {
  SelectStreamScreen, SelectBranchScreen,
  SelectSemesterScreen, SelectSubjectScreen
} from '../screens/SelectScreens';
import PapersScreen from '../screens/PapersScreen';
import { BookmarksScreen, SearchScreen } from '../screens/BookmarksAndSearchScreens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SelectClass" component={SelectClassScreen} />
      <Stack.Screen name="SelectStream" component={SelectStreamScreen} />
      <Stack.Screen name="SelectBranch" component={SelectBranchScreen} />
      <Stack.Screen name="SelectSemester" component={SelectSemesterScreen} />
      <Stack.Screen name="SelectSubject" component={SelectSubjectScreen} />
      <Stack.Screen name="Papers" component={PapersScreen} />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="Papers" component={PapersScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#E8EAED',
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 65,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: '#9AA0A6',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
          }}
        />
        <Tab.Screen
          name="SearchTab"
          component={SearchStack}
          options={{
            tabBarLabel: 'Search',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔍</Text>,
          }}
        />
        <Tab.Screen
          name="BookmarksTab"
          component={BookmarksScreen}
          options={{
            tabBarLabel: 'Bookmarks',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔖</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
