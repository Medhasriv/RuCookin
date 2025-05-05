import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface DividerProps {
  isDarkMode: boolean;
}

export function Divider({ isDarkMode }: DividerProps) {
  const styles = createStyles(isDarkMode);
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const createStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
      width: 327,
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
    },
    dividerText: {
      marginHorizontal: 10,
      fontSize: 16,
      color: isDarkMode ? "#FFC074" : "#A5402D",
      fontFamily: "Inter-SemiBold",
    },
  });