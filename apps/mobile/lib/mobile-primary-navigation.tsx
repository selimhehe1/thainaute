import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@thainaute/design-tokens";

export type MobilePrimaryRoute = "/" | "/practice" | "/progress";

const items: readonly {
  readonly label: string;
  readonly route: MobilePrimaryRoute;
}[] = [
  { label: "Aujourd’hui", route: "/" },
  { label: "Pratiquer", route: "/practice" },
  { label: "Progrès", route: "/progress" },
];

export function MobilePrimaryNavigation({
  activeRoute,
}: {
  readonly activeRoute: MobilePrimaryRoute;
}) {
  const router = useRouter();

  return (
    <View
      accessibilityRole="tablist"
      style={styles.navigation}
      testID="primary-navigation"
    >
      {items.map((item) => {
        const active = item.route === activeRoute;
        return (
          <Pressable
            key={item.route}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && styles.activeItem]}
            onPress={() => {
              if (!active) router.push(item.route);
            }}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>
              {item.label}
            </Text>
            {active && <View accessible={false} style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navigation: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    backgroundColor: colors.jasmine,
  },
  item: {
    minHeight: 44,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    gap: 4,
  },
  activeItem: { backgroundColor: colors.jadePale },
  label: { color: colors.inkSoft, fontSize: 13, fontWeight: "700" },
  activeLabel: { color: colors.jadeInk, fontWeight: "800" },
  activeDot: {
    width: 18,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.coral,
  },
});
