import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text,TextInput, Button,FlatList,StyleSheet,ActivityIndicator} from 'react-native';
import { checkAuth } from "../utils/authChecker";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";

