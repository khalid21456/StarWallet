import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/src/hooks/use-theme";
import { Card, Screen, Spacer, Text } from "@/src/ui";

/**
 * Profile — placeholder avatar + a list of settings rows. Rows are
 * non-interactive for now; navigation targets land with the
 * settings feature.
 */

export default function ProfileScreen() {
  const theme = useTheme();
  const PROFILE_IMAGE = require("../../assets/images/profile.png");

  const Row = ({
    icon,
    label,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }) => (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
      <Spacer size="md" horizontal />
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={theme.colors.textSecondary}
      />
    </Pressable>
  );

  return (
    <Screen title="Profile">
      {/* Avatar */}
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* <Ionicons name="person" size={44} color={theme.colors.primary} /> */}
          <Image
            source={PROFILE_IMAGE}
            style={{
              width: 80,
              height: 80,
              borderRadius: theme.radius.pill,
              borderWidth: 2,
              borderColor: theme.colors.card,
            }}
            contentFit="cover"
            transition={200}
          />
        </View>
        <Spacer size="md" />
        <Text variant="subheading">Najma Ali</Text>
        <Text variant="caption" tone="textSecondary">
          Tap to edit profile
        </Text>
      </View>

      <Spacer size="xl" />

      <Card padding="none">
        <Row icon="notifications-outline" label="Notifications" />
        <View style={{ height: 1, backgroundColor: theme.colors.border }} />
        <Row icon="card-outline" label="Linked accounts" />
        <View style={{ height: 1, backgroundColor: theme.colors.border }} />
        <Row icon="lock-closed-outline" label="Security" />
      </Card>

      <Spacer size="lg" />

      <Card padding="none">
        <Row icon="help-circle-outline" label="Help & support" />
        <View style={{ height: 1, backgroundColor: theme.colors.border }} />
        <Row icon="log-out-outline" label="Sign out" />
      </Card>
    </Screen>
  );
}
