import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function Divider({ isDarkMode }) {
  const styles = createStyles(isDarkMode);
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const createStyles = (isDarkMode) =>
  StyleSheet.create({
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: isDarkMode ? "#FFCF99" : "#ccc",
    },
    dividerText: {
      marginHorizontal: 10,
      fontSize: 16,
      color: isDarkMode ? "#FFC074" : "#A5402D",
      fontFamily: "Inter-SemiBold",
    },
  });
