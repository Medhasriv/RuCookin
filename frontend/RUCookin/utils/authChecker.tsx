import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if token session exist
export async function checkAuth(router: any) {
  try {
    // Contains token
    const token = await AsyncStorage.getItem("token");
    // Token not found then return to login page
    if (!token) {
      alert("Access denied! Please log in.");
      router.replace("/Login");
      return;
    }
  } catch (error) {
    console.error("Error accessing token:", error);
  }
}

// Check if user is an admin
export async function checkAdmin(router: any) {
  try {
    // Contains token
    const token = await AsyncStorage.getItem("token");
    // Token not found then return to login page
    if (!token) {
      alert("Access denied! Please log in.");
      router.replace("/Login");
      return;
    }
    // Get the accountType
    const accountType = await getTokenData("accountType");
    // Not admin change to login page
    if (accountType !== "admin") {
      alert("Access denied! Admin only!");
      router.replace("/Login");
      return;
    }
  } catch (error) {
    console.error("Error accessing token:", error);
    router.replace("/Login");
  }
}

// Get raw token 
export async function getToken(): Promise<string | null> {
  try {
    // Get token
    return await AsyncStorage.getItem("token");
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
}

//Pull token data for string  
export async function getTokenData(key: string): Promise<any | null> {
  try {
    // Get token
    const token = await AsyncStorage.getItem("token");
    // Token not found then return to login page
    if (!token) {
      return null;
    }
    // Decode the token
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(base64));
    return decodedPayload[key];
  }
  catch (error) {
    console.error("Error accessing token:", error);
    return null;
  }
}