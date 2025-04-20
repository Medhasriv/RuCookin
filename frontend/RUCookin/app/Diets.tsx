import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { checkAuth, getTokenData } from "../utils/authChecker";

const DIET_TYPES = [
  "Gluten Free",
  "Ketogenic",
  "Vegetarian",
  "Lacto-Vegetarian",
  "Ovo-Vegetarian",
  "Vegan",
  "Pescetarian",
  "Paleo",
  "Primal",
  "Low FODMAP",
  "Whole30",
];

export default function DietPreferences() {
  const [selected, setSelected] = useState<string[]>([]);
  const dark = useColorScheme() === "dark";
  const styles = createStyles(dark);
  const router = useRouter();

  useEffect(() => {
    checkAuth(router);
  }, []);

  const toggle = (d: string) =>
    setSelected((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const handleContinue = async () => {
    try {
      const username = await getTokenData("username");
      if (!username) return;

      const payload = { username: username.trim(), diet: selected };
      const res = await fetch("http://localhost:3001/routes/api/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.push("/Intolerances");
    } catch (e) {
      console.error("❌ Error during Diet:", e);
    }
  };

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <Text style={styles.heading}>Select your diet preferences</Text>

        <FlatList
          data={DIET_TYPES}
          numColumns={2}
          keyExtractor={(item) => item}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const active = selected.includes(item);
            return (
              <TouchableOpacity
                style={[styles.pill, active && styles.pillSelected]}
                onPress={() => toggle(item)}
              >
                <Text style={[styles.pillText, active && styles.pillTextSel]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity style={styles.continue} onPress={handleContinue}>
          <Text style={styles.continueTxt}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

/* ---------- styles ---------- */
const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? "#721121" : "#FFCF99",
    },
    content: { flex: 1, padding: 20 },
    heading: {
      fontFamily: "Inter-SemiBold",
      fontSize: 24,
      textAlign: "center",
      color: dark ? "#FFFFFF" : "#000000",
      marginBottom: 12,
    },
    /* grid */
    listContent: { flexGrow: 1, justifyContent: "flex-start" },
    row: { justifyContent: "space-evenly" },

    pill: {
      flexBasis: "30%", // ~3 per row
      margin: 8,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: dark ? "#FFCF99" : "#721121",
      alignItems: "center",
    },
    pillSelected: {
      backgroundColor: dark ? "#FFC074" : "#A5402D",
    },
    pillText: {
      fontFamily: "Inter-Regular",
      fontSize: 12,
      color: dark ? "#721121" : "#FFCF99",
      textAlign: "center",
    },
    pillTextSel: { fontWeight: "600" },

    continue: {
      marginTop: 20,
      marginHorizontal: 20,
      padding: 15,
      borderRadius: 8,
      backgroundColor: dark ? "#FFCF99" : "#721121",
    },
    continueTxt: {
      fontFamily: "Inter-SemiBold",
      fontSize: 16,
      textAlign: "center",
      color: dark ? "#721121" : "#FFFFFF",
    },
  });
