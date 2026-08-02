import { NotoSansThai_400Regular } from "@expo-google-fonts/noto-sans-thai/400Regular";
import { NotoSansThai_600SemiBold } from "@expo-google-fonts/noto-sans-thai/600SemiBold";

import { THAI_FONT_REGULAR, THAI_FONT_SEMIBOLD } from "./typography";

export const embeddedThaiFonts = {
  [THAI_FONT_REGULAR]: NotoSansThai_400Regular,
  [THAI_FONT_SEMIBOLD]: NotoSansThai_600SemiBold,
} as const;
