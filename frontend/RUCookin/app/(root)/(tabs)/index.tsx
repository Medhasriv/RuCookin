import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="font-inknutantiquasemibold color-primary">
        RUCookin
        </Text>
      <Link href="/LoginPage">Log In</Link>
      <Link href="/sign-in">Sign in</Link>
      <Link href="/explore">Explore</Link>
      <Link href="/profile">Profile</Link>
      <Link href="/recipes/1">Recipe</Link>
    </View>
    // Need to re-implement tab bar below. Was trying to implement Tailwind CSS into our project to make life easier.
  );
}
