import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants/theme.js";
import { useAuth } from "../context/AuthContext.jsx";
import React, { useState } from "react";

const usernameRegex = /^[a-zA-Z0-9_]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
    const [usernameError, setUsernameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passError, setPassError] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { register } = useAuth();

    const handleRegister = () => {
        let isValid = true;

        if (!usernameRegex.test(username) || username.length < 3) {
            setUsernameError(true);
            isValid = false;
        } else setUsernameError(false);

        if (!emailRegex.test(email) || email.trim().length < 5) {
            setEmailError(true);
            isValid = false;
        } else setEmailError(false);

        if (pass.length < 6) {
            setPassError(true);
            isValid = false;
        } else setPassError(false);

        if (isValid) {
            register({ username, email, pass })
            .then(() => { navigation.navigate("Login"); })
            .catch((error) => { Alert.alert("Error", error.message); });
        }
    };

    return (
        <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
            <Text style={styles.title}>Athletics Labs</Text>
            <Text style={styles.subtitle}>Register</Text>

            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <TextInput style={[styles.input, usernameError && styles.errorInput]} value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor={COLORS.gray_01} autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={35}/>
                    {usernameError && <View style={styles.errorDot} />}
                </View>

                <View style={styles.inputWrapper}>
                    <TextInput style={[styles.input, emailError && styles.errorInput]} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={COLORS.gray_01} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={360}/>
                    {emailError && <View style={styles.errorDot} />}
                </View>

                <View style={styles.inputWrapper}>
                    <TextInput style={[styles.input, passError && styles.errorInput]} value={pass} onChangeText={setPass} placeholder="Password" placeholderTextColor={COLORS.gray_01} secureTextEntry={true} autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={45}/>
                    {passError && <View style={styles.errorDot} />}
                </View>

                <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
                    <Text style={styles.registerBtnText}>Registrarse</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate("Login")}>
                <Text style={styles.registerBtnText}>Ingresar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: COLORS.blue_01,
        paddingHorizontal: 24,
        flex: 1,
    },
    title: {
        fontFamily: "Inter_black",
        fontSize: SIZES.f1,
        color: COLORS.white_01,
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: "Inter_medium",
        fontSize: SIZES.f3,
        color: COLORS.white_01,
        textAlign: "center",
        marginBottom: 24,
    },
    inputContainer: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        width: "80%",
        position: "relative",
    },
    input: {
        backgroundColor: COLORS.black_01,
        fontFamily: "Inter_medium",
        color: COLORS.white_01,
        fontSize: SIZES.f3,
        borderRadius: 12,
        width: "100%",
        padding: 12,
        borderColor: COLORS.transparent,
        borderWidth: 2,
    },
    errorInput: {
        borderColor: COLORS.red,
    },
    errorText: {
        color: COLORS.red,
        fontSize: SIZES.f4,
        marginBottom: 8,
        textAlign: "left",
        width: "80%",
    },
    errorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.red_01,
        position: "absolute",
        right: -15,
    },
    registerBtn: {
        backgroundColor: COLORS.white_01,
        borderRadius: 12,
        width: "80%",
        padding: 12,
        marginTop: 12,
    },
    loginBtn: {
        backgroundColor: COLORS.white_01,
        marginLeft: "10%",
        marginBottom: 24,
        borderRadius: 12,
        width: "80%",
        padding: 12,
    },
    registerBtnText: {
        fontFamily: "Inter_black",
        color: COLORS.black_01,
        textAlign: "center",
        fontSize: SIZES.f3,
    },
});
