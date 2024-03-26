import Animated, { SharedValue, runOnJS, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { CARD_HEIGHT, Card, CardProps } from "../Card";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useState } from "react";
import { styles } from "./styles";

type Props = {
  data: CardProps;
  cardsPosition: SharedValue<number[]>;
  scrollY: SharedValue<number>
  cardsCount: number;
}

export function MovableCard({ data, cardsPosition, scrollY, cardsCount }: Props) {
  const [moving, setMoving] = useState(false);
  const top = useSharedValue(cardsPosition.value[data.id] * CARD_HEIGHT);

  const longPressGesture = Gesture
    .LongPress()
    .onStart(() => {
      runOnJS(setMoving)(true);
    })
    .minDuration(200);

  const panGesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesDown((_, state) => {
      moving ? state.activate() : state.fail();
    })
    .onUpdate((event) => {
      top.value = event.absoluteY + scrollY.value;
    })
    .onFinalize(() => {
      runOnJS(setMoving)(false);
    })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: top.value - CARD_HEIGHT,
      zIndex: moving ? 1 : 0,
      opacity: withSpring(moving ? 1 : 0.4),
    }
  }, [moving]);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <GestureDetector gesture={Gesture.Race(panGesture, longPressGesture)}>
        <Card data={data} />
      </GestureDetector>
    </Animated.View>
  )
}