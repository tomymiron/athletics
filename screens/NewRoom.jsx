import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { COLORS, SIZES } from "../constants/theme";
import { makeRequest } from "../constants/axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import Icon from "../constants/Icon";


export default function NewRoom({route}) {
    const { name } = route.params;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { authState } = useAuth();

   return (
    <ScrollView style={[styles.mainContainer, { paddingTop: insets.top + 12 }]} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={[styles.backButton, { backgroundColor: COLORS.black_01 }]} onPress={() => navigation.navigate("RoomsScreen")}>
        <Icon name="arrow-left" color={COLORS.blue_01} size={SIZES.i3} />
      </TouchableOpacity>

      <Text style={styles.subTitle}>Nueva Sala</Text>
      <Text style={styles.title}>{name}</Text>

      <View style={styles.box01Container}>
        <Text style={styles.box01Title}>Crea tu Sala</Text>
        <Text style={styles.box01SubTitle}>Determina algunos detalles para poder asi{"\n"}invitar a tus amigos y jugar de manera{"\n"}simultanea!</Text>
      </View>

      <View style={{ height: 200 }} />
    </ScrollView>
  );
}
    
const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: COLORS.blue_01,
        paddingHorizontal: 24,
        flex: 1,
    },
    backButton: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 24,
        height: 48,
        width: 48,
    },
    subTitle: {
        fontFamily: "Inter_regular",
        color: COLORS.black_01,
        lineHeight: SIZES.f3,
        fontSize: SIZES.f3,
        marginBottom: 4,
        marginTop: 32,
    },
    title: {
        fontFamily: "Inter_bold",
        color: COLORS.black_01,
        lineHeight: SIZES.f1,
        fontSize: SIZES.f1,
    },

    box01Container: {
        backgroundColor: COLORS.black_01_10,
        paddingHorizontal: 32,
        paddingVertical: 24,
        borderRadius: 24,
        marginTop: 12,
        gap: 8,
    },
    box01Title: {
        fontFamily: "Inter_bold",
        color: COLORS.black_01,
        textAlign: "center",
        fontSize: SIZES.f1,
    },
    box01SubTitle: {
        fontFamily: "Inter_medium",
        color: COLORS.black_02,
        textAlign: "center",
        fontSize: SIZES.f5,
    },
});