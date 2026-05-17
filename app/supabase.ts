import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sfdiavixrtzeldstlwfy.supabase.co";

const supabaseAnonKey =
  "sb_publishable_c_XY1bp5K67R7XTMl3d-fA_HKdR8X4m";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});