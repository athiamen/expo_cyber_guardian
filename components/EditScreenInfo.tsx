import React from "react";
import { StyleSheet } from "react-native";
import {
    moderateScale,
    normalizeFont,
    scale,
    verticalScale,
} from "../app/lib/responsive";

import { ExternalLink } from "./ExternalLink";
import { MonoText } from "./StyledText";
import { Text, View } from "./Themed";

import Colors from "@/constants/Colors";

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View>
      <View style={styles.getStartedContainer}>
        <Text
          style={styles.getStartedText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          Open up the code for this screen:
        </Text>

        <View
          style={[styles.codeHighlightContainer, styles.homeScreenFilename]}
          darkColor="rgba(255,255,255,0.05)"
          lightColor="rgba(0,0,0,0.05)"
        >
          <MonoText>{path}</MonoText>
        </View>

        <Text
          style={styles.getStartedText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          Change any of the text, save the file, and your app will automatically
          update.
        </Text>
      </View>

      <View style={styles.helpContainer}>
        <ExternalLink
          style={styles.helpLink}
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet"
        >
          <Text style={styles.helpLinkText} lightColor={Colors.light.tint}>
            Tap here if your app doesn't automatically update after making
            changes
          </Text>
        </ExternalLink>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: moderateScale(50),
  },
  homeScreenFilename: {
    marginVertical: moderateScale(7),
  },
  codeHighlightContainer: {
    borderRadius: scale(3),
    paddingHorizontal: moderateScale(4),
  },
  getStartedText: {
    fontSize: normalizeFont(17),
    lineHeight: verticalScale(24),
    textAlign: "center",
  },
  helpContainer: {
    marginTop: moderateScale(15),
    marginHorizontal: moderateScale(20),
    alignItems: "center",
  },
  helpLink: {
    paddingVertical: moderateScale(15),
  },
  helpLinkText: {
    textAlign: "center",
  },
});
