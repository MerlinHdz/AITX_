import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";

export default function Index() {
  const micOpacity = useSharedValue(1); // Opacidad del micrófono
  const circleScale = useSharedValue(0); // Tamaño del círculo

  const micStyle = useAnimatedStyle(() => ({
    opacity: micOpacity.value,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleScale.value > 0 ? 1 : 0, // Evita que el círculo parpadee
  }));

  const startAnimation = () => {
    micOpacity.value = withTiming(0, { duration: 500 }); // Micrófono desaparece
    circleScale.value = withTiming(1, { duration: 600 }); // Círculo crece
  };

  return (
    <View style={styles.container}>
      <Text>Hello World</Text>

      {/* Micrófono con animación */}
      <Animated.View style={[micStyle, styles.micContainer]}>
        <TouchableOpacity onPress={startAnimation}>
          <FontAwesome name="microphone" size={40} color="black" />
        </TouchableOpacity>
      </Animated.View>

      {/* Círculo animado */}
      <Animated.View style={[styles.circle, circleStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micContainer: {
    marginBottom: 20,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
}); 