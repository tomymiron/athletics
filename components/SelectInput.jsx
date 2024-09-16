import DropDownPicker from "react-native-dropdown-picker";
import { COLORS, SIZES } from "../constants/theme";
import { Keyboard, Text } from "react-native";
import React, { useState } from "react";

export default function SelectInput({ itemsUsed, value, setValue, placeholder, lightTheme = false, secondaryPlaceholder = null, style }) {
  const [items, setItems] = useState(itemsUsed); 
  const [open, setOpen] = useState(false);

  return (
    <DropDownPicker
      onPress={() => Keyboard.dismiss()}
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={(value) => setValue(value)}
      setItems={setItems}
      placeholder={
        <>
        <Text style={{color: lightTheme ? COLORS.black_01 : COLORS.gray_01, fontSize: SIZES.f4, fontWeight: "500"}}>{placeholder}</Text>
        {secondaryPlaceholder && <Text style={{
          color: lightTheme ? COLORS.black_01 : COLORS.gray_01,
          fontWeight: "700",
          fontSize: SIZES.f5
        }}>{"\n" + secondaryPlaceholder}</Text>}
        </>
      }
      style={[{
        backgroundColor: lightTheme ? COLORS.blue_01 : COLORS.black_01,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 6,
        borderWidth: 0,
      }, style]}
      labelStyle={{
        color: lightTheme ? COLORS.black_01 : COLORS.white_01,
        fontSize: SIZES.f4,
        fontWeight: "700",
      }}
      dropDownContainerStyle={{
        backgroundColor: lightTheme ? COLORS.blue_01 : COLORS.black_01,
        borderWidth: 0,
      }}
      listItemLabelStyle={{
        color: lightTheme ? COLORS.black_01 : COLORS.white_01,
        fontSize: SIZES.f5,
        fontWeight: "500",
      }}
      arrowIconStyle={{
        tintColor: lightTheme ? COLORS.black_01 : COLORS.blue_01,
      }}
      tickIconStyle={{
        tintColor: lightTheme ? COLORS.black_01 : COLORS.blue_01,
      }}
    />
  );
}