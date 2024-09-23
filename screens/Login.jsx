import { StyleSheet, Text, View, TouchableWithoutFeedback, TouchableOpacity, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants/theme.js";
import React, { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.mainContainer, {paddingTop: insets.top}]}>
            <Text>Athletics Labs</Text>

            <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email"/>
                <TextInput style={styles.input} value={pass}  onChangeText={setPass}  placeholder="Password"/>
                <TouchableOpacity style={styles.loginBtn}>
                    <Text style={styles.loginBtnText}>Ingresar</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: COLORS.blue_01,
        paddingHorizontal: 24,
        flex: 1,
    },
    inputContainer: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        gap: 4,
    },
    input: {
        backgroundColor: COLORS.black_01,
        fontFamily: "Inter_medium",
        color: COLORS.white_01,
        fontSize: SIZES.f3,
        borderRadius: 12,
        width: "80%",
        padding: 12,
    },
    loginBtn: {
        backgroundColor: COLORS.white_01,
        borderRadius: 12,
        width: "80%",
        padding: 12,
    },
    loginBtnText: {
        fontFamily: "Inter_black",
        color: COLORS.black_01,
        textAlign: "center",
        fontSize: SIZES.f3,
    }
})