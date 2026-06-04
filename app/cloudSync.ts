import { supabase } from "./supabase";

// Ελέγχει αν το id είναι real Supabase UUID
const isUuid = (id: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

// Return tool → status: Available, holder: "", borrowedBy: "", location: Warehouse
export const cloudReturnTool = async (id: string) => {
  if (!isUuid(id)) return;

  const { error } = await supabase
    .from("tools")
    .update({
      status: "Available",
      holder: "",
      borrowed_by: "",
      location: "Warehouse",
      return_date: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) console.error("cloudReturnTool error:", error.message);
};

// Delete tool → διαγράφει γραμμή από Supabase
export const cloudDeleteTool = async (id: string) => {
  if (!isUuid(id)) return;

  const { error } = await supabase
    .from("tools")
    .delete()
    .eq("id", id);

  if (error) console.error("cloudDeleteTool error:", error.message);
};

// Update quantity → ενημερώνει μόνο το quantity
export const cloudUpdateToolQuantity = async (id: string, quantity: string) => {
  if (!isUuid(id)) return;

  const { error } = await supabase
    .from("tools")
    .update({ quantity })
    .eq("id", id);

  if (error) console.error("cloudUpdateToolQuantity error:", error.message);
};