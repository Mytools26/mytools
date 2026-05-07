import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Tool = {
  id?: string;
  name: string;
  profession: string;
  category: string;
  brand: string;
  quantity: string;
  location: string;
  holder: string;
  status: string;
  borrowedBy: string;
  returnDate: string;
  notes: string;
};

interface ToolState {
  tools: Tool[];
  addTool: (tool: Tool) => void;
  updateTool: (id: string, updatedTool: Tool) => void;
  deleteTool: (id: string) => void;
}

export const useToolStore = create<ToolState>()(
  persist(
    (set) => ({
      tools: [],

      addTool: (tool) =>
        set((state) => ({
          tools: [...state.tools, tool],
        })),

      updateTool: (id, updatedTool) =>
        set((state) => ({
          tools: state.tools.map((tool, index) => {
            const realId = tool.id || `old-tool-${index}`;

            return realId === id
              ? {
                  ...updatedTool,
                  id: realId,
                }
              : tool;
          }),
        })),

      deleteTool: (id) =>
        set((state) => ({
          tools: state.tools.filter((tool, index) => {
            const realId = tool.id || `old-tool-${index}`;
            return realId !== id;
          }),
        })),
    }),
    {
      name: "my-tools-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);