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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  micContainer: {
    position: "absolute",
    bottom: 80,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 50,
  },
  circle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#fff",
  },
});