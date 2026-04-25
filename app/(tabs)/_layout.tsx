import { Tabs } from 'expo-router';
import { Icon } from 'react-native-paper';
import { COLORS } from '../../src/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.SURFACE,
          borderTopColor: COLORS.OUTLINE,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: COLORS.ACCENT,
        tabBarInactiveTintColor: COLORS.ON_SURFACE_MUTED,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Icon source="view-dashboard" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Icon source="format-list-bulleted" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="charts"
        options={{
          title: 'Charts',
          tabBarIcon: ({ color, size }) => <Icon source="chart-bar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="parts"
        options={{
          title: 'Parts',
          tabBarIcon: ({ color, size }) => <Icon source="cog" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tax"
        options={{
          title: 'Tax',
          tabBarIcon: ({ color, size }) => <Icon source="receipt" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Icon source="account-cog" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
