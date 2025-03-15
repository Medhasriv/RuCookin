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
        const payload = JSON.parse(Buffer.from(token.split(".")[1], 'base64').toString());
        return payload[key] ?? null;
    }
        catch(error) {
            console.error("Error accessing token:", error);
            return null;
         }
}