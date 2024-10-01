const { height, width } = Dimensions.get("window");
import { Dimensions } from "react-native";

export const COLORS = {
    black_01: "#0F1113",
    black_01_50: "#0F111380",
    black_01_25: "#0F111340",
    black_01_10: "#0F111319",
    black_02: "#171921",
    black_02_25: "#17192140",
    black_02_80: "#171921CC",

    white_01: "#EEF0FA",
    white_01_15: "#EEF0FA26",
    white_02: "#B8BAC2",

    gray_01: "#7D7D7D",

    blue_01: "#3AD8EF",
    blue_02: "#0A7B8B",
    blue_03: "#749AED",
    blue_01_50: "#3AD9EF80",
    blue_01_25: "#3AD9EF40",
    blue_01_15: "#3AD9EF26",
    blue_01_80: "#3AD9EFCC",
    blue_03_15: "#749AED26",

    purple_01: "#976CF6",

    red_01: "#F54A4A",

    yellow_01: "#F6C74E",

    transparent: "#0000",
};

export const SIZES = {
    widthFontSize: width < 420 ? width < 300 ? 70 : 80 : 100,
    pm1: width < 400 ? width < 300 ? 18: 20: 30,
    bm1: 30,
    bm2: width < 400 ? width < 300 ? 18: 20: 24,
    bm3: width < 400 ? width < 300 ? 16: 18: 20,
    bm4: 12,
    bh1: height < 800 ? height < 700 ? 32 : 48 : 64,
    f1: 32,
    f2: width < 400 ? width < 300 ? 24 : 26: 28,
    f3: width < 400 ? width < 300 ? 18 : 20 : 22,
    f4: 18,
    f5: 14,
    f6: 12,
    f7: 11, 
    i1: 32,
    i2: 28,
    i3: 24,
    i4: 18,
}

export const BLURHASH = {
    light_01: "L34:G#Zha0kWi^Z$aKZ~p{e.krkq",
    dark_01: "L22s:{VDZ~kWa0Z#aJZ~qFadkrkr",
    black_01: "L01yRhj[fQj[j[fQfQfQfQfQfQfQ",
    black_02: "L02rz7j[fQj[j]fQfQfQfQfQfQfQ",
}