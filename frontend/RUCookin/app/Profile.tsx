import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { checkAuth,getTokenData } from "../utils/authChecker"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = () => {
    const colorScheme = useColorScheme();
    const [isDarkMode] = useState(colorScheme === 'dark');
    const [userData, setUserData] = useState({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        location: "",
        cuisineLike: [],
        cuisineDislike: [],
        diet: [],
        intolerance: [],
    });

    const router = useRouter();

    useEffect(() => {
        checkAuth(router);
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const UserInfo = await AsyncStorage.getItem("UserInfo");
            if (UserInfo) {
                setUserData(JSON.parse(UserInfo));
            }

            const UserPreferences = await AsyncStorage.getItem("UserPreferences");
            if (UserPreferences) {
                setUserData(prevState => ({
                    ...prevState,
                    ...JSON.parse(UserPreferences),
                }));
            }
        } catch (error) {
            console.error("Failed to load user data", error);
        }
    };

    const handleChange = (field: string, value: string) => {
        setUserData(prevState => ({ ...prevState, [field]: value }));
    };

    const handleSave = async () => {
        if (!userData.username || !userData.email) {
            alert("Username and Email are required.");
            return;
        }

        try {
            await AsyncStorage.setItem("UserInfo", JSON.stringify(userData));
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error saving user data", error);
        }
    };

    const styles = createStyles(isDarkMode);

    return (
        <View style={styles.viewColor}>
            <SafeAreaView style={styles.titleContainer}>
                <Text style={styles.logoText}>RUCookin'</Text>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.profileHeader}>Profile</Text>

                {/* Non-editable fields */}

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Username:</Text>
                    <Text style={styles.value}>{userData.username}</Text>
                </View>

                {/* Editable fields */}

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Email:</Text>
                    <TextInput
                        style={styles.input}
                        value={userData.email}
                        onChangeText={(text) => handleChange("email", text)}
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>First Name:</Text>
                    <TextInput
                        style={styles.input}
                        value={userData.firstName}
                        onChangeText={text => handleChange("firstName", text)}
                    />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Last Name:</Text>
                    <TextInput
                        style={styles.input}
                        value={userData.lastName}
                        onChangeText={text => handleChange("lastName", text)}
                    />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Location:</Text>
                    <TextInput
                        style={styles.input}
                        value={userData.location}
                        onChangeText={text => handleChange("location", text)}
                        placeholder="Optional"
                    />
                </View>

                {/* Cuisine Preferences */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Cuisine Likes:</Text>
                    <Text style={styles.value}>{userData.cuisineLike?.length ? userData.cuisineLike.join(", ") : "None"}</Text>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Cuisine Dislikes:</Text>
                    <Text style={styles.value}>{userData.cuisineDislike?.length ? userData.cuisineDislike.join(", ") : "None"}</Text>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Dietary Preferences:</Text>
                    <Text style={styles.value}>{userData.diet?.length ? userData.diet.join(", ") : "None"}</Text>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Intolerances:</Text>
                    <Text style={styles.value}>{userData.intolerance?.length ? userData.intolerance.join(", ") : "None"}</Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleSave}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => {
                        AsyncStorage.removeItem("token");
                        router.push('/Login');
                    }}>
                        <Text style={styles.buttonText}>Log Out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => router.push('/HomePage')}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

function createStyles(isDarkMode: boolean) {
    return StyleSheet.create({
        viewColor: {
            flex: 1,
            backgroundColor: isDarkMode ? '#701C1C' : '#FFCF99',
        },
        titleContainer: {
            padding: 20,
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#721121' : '#FFCF99',
        },
        logoText: {
            fontSize: 30,
            fontFamily: 'InknutAntiqua-SemiBold',
            color: isDarkMode ? "#FFCF99" : "#721121",
        },
        contentContainer: {
            padding: 20,
        },
        profileHeader: {
            fontSize: 26,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 20,
            color: isDarkMode ? "#FFCF99" : "#721121",
        },
        fieldContainer: {
            marginBottom: 15,
        },
        label: {
            fontSize: 18,
            fontWeight: "bold",
            color: isDarkMode ? "#FFCF99" : "#721121",
        },
        value: {
            fontSize: 16,
            padding: 10,
            borderRadius: 5,
            backgroundColor: isDarkMode ? "#721121" : "#FFF",
            color: isDarkMode ? "#FFCF99" : "#721121",
        },
        input: {
            fontSize: 16,
            padding: 10,
            borderWidth: 1,
            borderColor: isDarkMode ? "#FFCF99" : "#721121",
            borderRadius: 5,
            color: isDarkMode ? "#FFCF99" : "#721121",
            backgroundColor: isDarkMode ? "#721121" : "#FFF",
        },
        buttonContainer: {
            marginTop: 20,
            alignItems: "center",
        },
        button: {
            padding: 15,
            borderRadius: 8,
            backgroundColor: isDarkMode ? '#FFCF99' : '#721121',
            margin: 10, // Adds margin to separate the buttons
            width: '80%', // Optional, makes buttons fit better in some screens
        },
        buttonText: {
            color: isDarkMode ? '#721121' : '#FFCF99',
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
        },
    });
}

export default Profile;
