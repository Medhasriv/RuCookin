import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  View,
} from "react-native";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { checkAuth, getTokenData } from "../utils/authChecker";

const CUISINE_TYPES = [
  "African","Asian","American","British","Cajun","Caribbean",
  "Chinese","Eastern European","European","French","German","Greek",
  "Indian","Irish","Italian","Japanese","Jewish","Korean",
  "Latin American","Mediterranean","Mexican","Middle Eastern","Nordic",
  "Southern","Spanish","Thai","Vietnamese",
];

export default function CuisineDislikes() {
  const [disliked, setDisliked] = useState<string[]>([]);
  const dark = useColorScheme() === "dark";
  const styles = createStyles(dark);
  const router = useRouter();

  useEffect(() => {
    checkAuth(router);
  }, []);

  const toggle = (c: string) =>
    setDisliked((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const handleContinue = async () => {
    try {
      const username = await getTokenData("username");
      if (!username) return;

      const payload = { username: username.trim(), cuisineDislike: disliked };
      const res = await fetch("http://localhost:3001/routes/api/cuisineDislike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.push("/Diets");
      else console.error(await res.json());
    } catch (e) {
      console.error("Cuisine Dislike error:", e);
    }
  };

  /* ------------ UI ----------------------------------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Select cuisines you dislike</Text>

      {/* body flexes to fill, centres grid vertically */}
      <View style={styles.body}>
        <FlatList
          data={CUISINE_TYPES}
          numColumns={3}
          keyExtractor={(item) => item}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const selected = disliked.includes(item);
            return (
              <TouchableOpacity
                style={[styles.pill, selected && styles.pillSelected]}
                onPress={() => toggle(item)}
              >
                <Text style={[styles.pillText, selected && styles.pillTextSel]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* fixed near bottom */}
      <TouchableOpacity style={styles.continue} onPress={handleContinue}>
        <Text style={styles.continueTxt}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ----------------- STYLES --------------------------------------------- */
const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? "#721121" : "#FFCF99",
      paddingTop: 10,
    },
    heading: {
      fontFamily: "Inter-SemiBold",
      fontSize: 24,
      textAlign: "center",
      color: dark ? "#FFF" : "#000",
      marginTop: 25,
      marginBottom: 4,
    },

    /* centre grid vertically */
    body: { 
      flex: 1, 
      justifyContent: "flex-start", 
      marginTop: 50,
    },
    listContent: { 
      flexGrow: 1, 
      justifyContent: "flex-start",
    },
    row: { justifyContent: "space-evenly" },

    pill: {
      flex: 1,
      flexBasis: "30%",
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
      marginHorizontal: 20,
      marginBottom: 24, /* leaves space for home‑indicator */
      padding: 15,
      borderRadius: 8,
      backgroundColor: dark ? "#FFCF99" : "#721121",
    },
    continueTxt: {
      fontFamily: "Inter-SemiBold",
      fontSize: 16,
      color: dark ? "#721121" : "#FFFFFF",
      textAlign: "center",
    },
  });
