import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'

const Recipe = () => {
    const { id } = useLocalSearchParams();
    return (
        <View>
        <Text>Recipe {id} </Text>
        </View>
    )
}

export default Recipe