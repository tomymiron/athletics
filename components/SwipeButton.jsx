import Animated, { useAnimatedGestureHandler, useSharedValue, useAnimatedStyle, withSpring, interpolate, Extrapolate, interpolateColor, runOnJS, } from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { Dimensions, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES } from "../constants/theme";
import React, { useState } from "react";
import Icon from "../constants/Icon";

const BUTTON_WIDTH = Dimensions.get("window").width - 24 * 2;
const BUTTON_HEIGHT = 72;
const BUTTON_PADDING = 6;
const SWIPEABLE_DIMENSIONS = BUTTON_HEIGHT - 2 * BUTTON_PADDING;

const H_WAVE_RANGE = SWIPEABLE_DIMENSIONS + 2 * BUTTON_PADDING;
const H_SWIPE_RANGE = BUTTON_WIDTH - 2 * BUTTON_PADDING - SWIPEABLE_DIMENSIONS;
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const SwipeButton = ({ onToggle, text, setIsSwiping }) => {
  const [toggled, setToggled] = useState(false);
  const X = useSharedValue(0);

  const handleComplete = (isToggled) => {
    impactAsync(ImpactFeedbackStyle.Medium);       
    onToggle(isToggled);
  };
  
  const animatedGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {ctx.completed = toggled;runOnJS(setIsSwiping)(true);},
    onActive: (e, ctx) => {let newValue = e.translationX;if (newValue >= 0 && newValue <= H_SWIPE_RANGE) X.value = newValue;},
    onEnd: () => {
      if (X.value > BUTTON_WIDTH / 2 - SWIPEABLE_DIMENSIONS / 2) runOnJS(handleComplete)(true);
      X.value = withSpring(0);
      runOnJS(setIsSwiping)(false);
    },
  });

  const InterpolateXInput = [0, H_SWIPE_RANGE];
  const AnimatedStyles = {
    swipeCont: useAnimatedStyle(() => {return {};}),
    colorWave: useAnimatedStyle(() => {return {width: H_WAVE_RANGE + X.value, opacity: interpolate(X.value, InterpolateXInput, [0, 1]),};}),
    swipeable: useAnimatedStyle(() => {
      return {
        backgroundColor: interpolateColor(X.value, [0, BUTTON_WIDTH - SWIPEABLE_DIMENSIONS - BUTTON_PADDING], ["#000", "#000"]),
        transform: [{ translateX: X.value }],
      };
    }),
    swipeText: useAnimatedStyle(() => {
      return {
        opacity: interpolate(X.value, InterpolateXInput, [1, 0]),
        transform: [{translateX: interpolate( X.value, InterpolateXInput, [0, BUTTON_WIDTH / 2 - SWIPEABLE_DIMENSIONS], Extrapolate.CLAMP),},],
      };
    }),
  };


  return (
    <Animated.View style={[styles.swipeCont, AnimatedStyles.swipeCont]}>
      <AnimatedLinearGradient style={[AnimatedStyles.colorWave, styles.colorWave]} colors={[COLORS.blue_01, COLORS.white_01]} start={{ x: 0.0, y: 0.5 }} end={{ x: 1, y: 0.5 }} />
      <PanGestureHandler onGestureEvent={animatedGestureHandler}>
        <Animated.View style={[styles.swipeable, AnimatedStyles.swipeable]}>
            <Icon name="settings" size={SIZES.i3} color={COLORS.white_01}/>
        </Animated.View>
      </PanGestureHandler>
      <Animated.Text style={[styles.swipeText, AnimatedStyles.swipeText]}>{text}</Animated.Text>
      <View style={{position: "absolute", zIndex: -1, right: 0, flexDirection: "row"}}>
        <View style={{marginLeft: -12, opacity: .1}}>
            <Icon name="arrow-right-l" color={COLORS.black_01} size={SIZES.i3}/>
        </View>
        <View style={{marginLeft: -12, opacity: .5}}>
            <Icon name="arrow-right-l" color={COLORS.black_01} size={SIZES.i3}/>
        </View>
        <View style={{marginLeft: -12, marginRight: 12}}>
            <Icon name="arrow-right-l" color={COLORS.black_01} size={SIZES.i3}/>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  swipeCont: {
    backgroundColor: COLORS.white_01,
    borderRadius: BUTTON_HEIGHT,
    justifyContent: "center",
    padding: BUTTON_PADDING,
    height: BUTTON_HEIGHT,
    alignItems: "center",
    width: BUTTON_WIDTH,
    flexDirection: "row",
  },
  colorWave: {
    borderRadius: BUTTON_HEIGHT,
    height: BUTTON_HEIGHT,
    position: "absolute",
    left: 0,
  },
  swipeable: {
    borderRadius: SWIPEABLE_DIMENSIONS,
    height: SWIPEABLE_DIMENSIONS,
    width: SWIPEABLE_DIMENSIONS,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: BUTTON_PADDING,
  },
  swipeText: {
    fontFamily: "Inter_semiBold",
    lineHeight: SIZES.f3 - 2,
    fontSize: SIZES.f3 - 2,
    color: COLORS.black_01,
    alignSelf: "center",
  },
});

export default SwipeButton;