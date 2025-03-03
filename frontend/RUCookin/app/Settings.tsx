import { useState } from "react";
import { Platform, StyleSheet, Text, Switch, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";

const SettingsPage = () => {
    const colorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
    const router = useRouter();

    const toggleSwitch = () => {
        setIsDarkMode(previousState => !previousState);
    };

    const styles = createStyles(isDarkMode);

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
                <Text style={styles.webSettingsText}>Settings</Text>
            </SafeAreaView>

            <SafeAreaView style={styles.settingsContainer}>
                <TouchableOpacity onPress={() => router.push('/Notifications')}>
                    <Text style={styles.webSettingsText}>Notifications</Text>
                </TouchableOpacity>

                {/* Dark/Light Mode with Switch */}
                <View style={styles.switchContainer}>
                    <Text style={styles.webSettingsText}>Dark Mode</Text>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleSwitch}
                        trackColor={{ false: "#D3D3D3", true: "#FFCF99" }}
                        thumbColor={isDarkMode ? "#721121" : "#701C1C"}
                    />
                </View>

                <TouchableOpacity onPress={() => router.push('/Privacy')}>
                    <Text style={styles.webSettingsText}>Privacy</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/Offline')}>
                    <Text style={styles.webSettingsText}>Offline Mode</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/Login')}>
                    <Text style={styles.webSettingsText}>Log Out</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/HomePage')}>
                    <Text style={styles.webSettingsText}>Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

function createStyles(isDarkMode: boolean) {
    return StyleSheet.create({
        viewColor: {
            backgroundColor: isDarkMode ? '#701C1C' : '',
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
            paddingLeft: 20,
        },
        switchContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: 20,
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
