import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if token session exist
export async function checkAuth(router: any){
    try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
        alert("Access denied! Please log in.");
        router.replace("/Login");
        return;
    }
 }  catch(error) {
    console.error("Error accessing token:", error);
 }
}


 // Check if token session exist
export async function checkAdmin(router: any){
  try {
  const token = await AsyncStorage.getItem("token");
  if (!token) {
      alert("Access denied! Please log in.");
      router.replace("/Login");
      return;
  }
  const accountType = await getTokenData("accountType");
  console.log(accountType) //returns undefined
  if (accountType !== "admin") {
    alert("Access denied! Admin only!");
    router.replace("/Login");
    return;
}
}  catch(error) {
  console.error("Error accessing token:", error);
  router.replace("/Login");
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
        console.log("🔍 FULL decoded payload:", decodedPayload);
        return decodedPayload[key];
    }
        catch(error) {
            console.error("Error accessing token:", error);
            return null;
         }
}

