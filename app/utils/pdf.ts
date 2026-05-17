import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

export const exportPdf = async (html: string) => {
  try {
    const file = await Print.printToFileAsync({
      html,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri);
    } else {
      Alert.alert("PDF Created", file.uri);
    }
  } catch (error) {
    Alert.alert("PDF Error", "Failed to export PDF");
    console.log(error);
  }
};