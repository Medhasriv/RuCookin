import React, { useState, useEffect } from 'react';
import { View, Text, Switch } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerRootComponent } from 'expo';

const scheduleDailyNotifications = () => {
  const currentDate = new Date();
  const getTriggerTime = (targetHour) => {
    const triggerDate = new Date(currentDate);
    triggerDate.setHours(targetHour, 0, 0, 0);
    if (triggerDate < currentDate) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }
    return triggerDate;
  };

  const notificationTimes = [20, 13, 21];
  notificationTimes.forEach((time) => {
    const trigger = getTriggerTime(time);
    Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to plan a meal!`,
        body: `It's ${time}:00! Check your saved recipes, or find something new!.`,
      },
      trigger,
    });
  });
};

const Index = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const getNotificationStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('notificationsEnabled');
        if (status !== null) {
          setIsNotificationsEnabled(status === 'true');
        }
      } catch (error) {
        console.error('Error loading notification status:', error);
      }
    };
    getNotificationStatus();
  }, []);

  const toggleNotificationsSwitch = async () => {
    const newStatus = !isNotificationsEnabled;
    setIsNotificationsEnabled(newStatus);
    await AsyncStorage.setItem('notificationsEnabled', newStatus.toString());

    if (newStatus) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Notification permissions were not granted.');
      }
    }
  };

  useEffect(() => {
    if (isNotificationsEnabled && hasPermission) {
      scheduleDailyNotifications();
    }
  }, [isNotificationsEnabled, hasPermission]);

  return (
    <View>
      <Text>Enable Notifications:</Text>
      <Switch
        value={isNotificationsEnabled}
        onValueChange={toggleNotificationsSwitch}
      />
    </View>
  );
};

registerRootComponent(Index);
