import { Router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if token session exist
export async function checkAuth(router: Router){
    try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
        alert("Access denied! Please log in.");
        router.replace("/Login");
    }
 }  catch(error) {
    console.error("Error accessing token:", error);
 }

}


//Pull token data for string  
export async function getTokenData(key: string): Promise<any | null> {
    try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            return null;
        }
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = JSON.parse(atob(base64));
        return decodedPayload[key];
    }
        catch(error) {
            console.error("Error accessing token:", error);
            return null;
         }
}


//Pull token data for Userid  
export async function getUserID(): Promise<any | null> {
    try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
            console.error("User ID not found in token.");
            return null;
        }
        return userId;
    }
        catch(error) {
            console.error("Error retrieving user ID:", error);
            return null;
         }
}