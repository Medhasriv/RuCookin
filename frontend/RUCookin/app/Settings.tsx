import { Link, useRouter } from "expo-router";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, TextInput, useColorScheme, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from "react";
import { Divider } from "../components/Divider";
import React from 'react';

const colorScheme = useColorScheme();
const isDarkMode = colorScheme === 'dark';
const styles = createStyles(isDarkMode);

const SettingsPage = () => {
    const router = useRouter();

    return (
        <View style={styles.viewColor}>
            <SafeAreaView style={styles.titleContainer}>
                <Text
                    style={Platform.select({
                        ios: styles.iosLogoText,
                        android: styles.iosLogoText,
                        web: styles.webLogoText,
                    })}
                    numberOfLines={1}
                    adjustsFontSizeToFit={Platform.OS !== 'web'}
                >
                    RUCookin'
                </Text>
            </SafeAreaView>

            <SafeAreaView style={styles.contentContainer}>
                <Text>Username</Text>
            </SafeAreaView>

            <SafeAreaView style={styles.settingsContainer}>
                <TouchableOpacity onPress={() => router.push('/Notifications')}>
                    <Text style={styles.webSettingsText}>Notifications</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/Theme')}>
                    <Text style={styles.webSettingsText}>Dark/Light Mode</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/Privacy')}>
                    <Text style={styles.webSettingsText}>Privacy</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/Offline')}>
                    <Text style={styles.webSettingsText}>Offline Mode</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};
function createStyles(isDarkMode: boolean) {
    return StyleSheet.create({
        viewColor: {
            backgroundColor: isDarkMode ? 'black' : '',
        },
        titleContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#721121' : '#FFCF99',
        },
        iosLogoText: {
            width: 200,
            fontSize: 30,
            fontFamily: 'InknutAntiqua-SemiBold',
            color: isDarkMode ? "#FFCF99" : "#721121",
        },
        webLogoText: {
            fontSize: 30,
            fontFamily: 'InknutAntiqua-SemiBold',
            color: isDarkMode ? "#FFCF99" : "#721121",
        },
        contentContainer: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        settingsContainer: {
            justifyContent: 'space-evenly',
            paddingVertical: 40,
            paddingLeft: 200,
        },
        webSettingsText: {
            fontSize: 23,
            fontFamily: 'Inter-Regular',
            padding: 15,
            color: isDarkMode ? "#FFCF99" : "#721121",
        },
    });
}

export default SettingsPage;
