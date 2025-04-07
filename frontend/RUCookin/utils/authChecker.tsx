import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if token session exist
export async function checkAuth(router: any){
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


// Get raw token 
export async function getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
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

