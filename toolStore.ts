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
  image?: string;
};

export type CustomTool = {
  id: string;
  name: string;
  profession: string;
  category: string;
  image?: string;
};

export type HistoryLog = {
  id: string;
  type: "ADD" | "ASSIGN" | "RETURN" | "DELETE" | "UPDATE" | "CUSTOM_TOOL" | "WAREHOUSE";
  toolName: string;
  quantity?: string;
  workerName?: string;
  location?: string;
  message: string;
  createdAt: string;
};

export type Language = "en" | "el" | "de";

interface ToolState {
  tools: Tool[];
  warehouseStock: Record<string, string>;
  customTools: CustomTool[];
  historyLogs: HistoryLog[];
  language: Language;

  setTools: (tools: Tool[]) => void;
  addTool: (tool: Tool) => void;
  updateTool: (id: string, updatedTool: Tool) => void;
  deleteTool: (id: string) => void;
  assignTool: (id: string, workerName: string, quantity?: string | number) => void;
  returnTool: (id: string, quantity?: string | number) => void;
  setWarehouseQuantity: (toolName: string, quantity: string) => void;
  addCustomTool: (tool: CustomTool) => void;
  addHistoryLog: (log: Omit<HistoryLog, "id" | "createdAt">) => void;
  deleteHistoryLog: (id: string) => void;
  clearHistoryLogs: () => void;
  duplicateWorkerGroup: (oldWorkerName: string, newWorkerName: string, newLocation: string) => void;
  setLanguage: (lang: Language) => void;
}

const createLog = (log: Omit<HistoryLog, "id" | "createdAt">): HistoryLog => ({
  ...log,
  id: `${Date.now()}-${Math.random()}`,
  createdAt: new Date().toISOString(),
});

const getRealId = (tool: Tool, index: number) => tool.id || `old-tool-${index}`;

const toNumber = (value?: string | number) => {
  const n = Number(value || 0);
  return Number.isNaN(n) ? 0 : n;
};

const createToolId = (name: string) => `${Date.now()}-${Math.random()}-${name}`;

export const useToolStore = create<ToolState>()(
  persist(
    (set) => ({
      tools: [],
      warehouseStock: {},
      customTools: [],
      historyLogs: [],
      language: "en",

      setLanguage: (lang) => set(() => ({ language: lang })),

      setTools: (tools) => set(() => ({ tools })),

      addTool: (tool) =>
        set((state) => {
          const safeTool: Tool = {
            ...tool,
            id: tool.id || createToolId(tool.name),
          };

          const existingIndex = state.tools.findIndex((existingTool) => {
            return (
              existingTool.name.toLowerCase() === safeTool.name.toLowerCase() &&
              (existingTool.profession || "") === (safeTool.profession || "") &&
              (existingTool.category || "") === (safeTool.category || "") &&
              (existingTool.location || "") === (safeTool.location || "") &&
              (existingTool.borrowedBy || "") === (safeTool.borrowedBy || "") &&
              (existingTool.holder || "") === (safeTool.holder || "") &&
              (existingTool.status || "") === (safeTool.status || "")
            );
          });

          const mergedTools =
            existingIndex >= 0
              ? state.tools.map((existingTool, index) => {
                  if (index !== existingIndex) return existingTool;

                  return {
                    ...existingTool,
                    quantity: String(toNumber(existingTool.quantity) + toNumber(safeTool.quantity)),
                  };
                })
              : [...state.tools, safeTool];

          return {
            tools: mergedTools,
            historyLogs: [
              createLog({
                type: safeTool.borrowedBy || safeTool.holder ? "ASSIGN" : "ADD",
                toolName: safeTool.name,
                quantity: safeTool.quantity,
                workerName: safeTool.borrowedBy || safeTool.holder,
                location: safeTool.location,
                message: safeTool.borrowedBy || safeTool.holder
                  ? `${safeTool.name} x${safeTool.quantity} assigned to ${safeTool.borrowedBy || safeTool.holder}`
                  : existingIndex >= 0
                    ? `${safeTool.name} x${safeTool.quantity} merged into existing inventory`
                    : `${safeTool.name} x${safeTool.quantity} added to inventory`,
              }),
              ...state.historyLogs,
            ],
          };
        }),

      updateTool: (id, updatedTool) =>
        set((state) => ({
          tools: state.tools.map((tool, index) => {
            const realId = getRealId(tool, index);
            return realId === id ? { ...updatedTool, id: realId } : tool;
          }),
          historyLogs: [
            createLog({
              type: "UPDATE",
              toolName: updatedTool.name,
              quantity: updatedTool.quantity,
              workerName: updatedTool.borrowedBy || updatedTool.holder,
              location: updatedTool.location,
              message: `${updatedTool.name} updated`,
            }),
            ...state.historyLogs,
          ],
        })),

      deleteTool: (id) =>
        set((state) => {
          const toolToDelete = state.tools.find((tool, index) => getRealId(tool, index) === id);

          return {
            tools: state.tools.filter((tool, index) => getRealId(tool, index) !== id),
            historyLogs: toolToDelete
              ? [
                  createLog({
                    type: "DELETE",
                    toolName: toolToDelete.name,
                    quantity: toolToDelete.quantity,
                    workerName: toolToDelete.borrowedBy || toolToDelete.holder,
                    location: toolToDelete.location,
                    message: `${toolToDelete.name} deleted`,
                  }),
                  ...state.historyLogs,
                ]
              : state.historyLogs,
          };
        }),

      assignTool: (id, workerName, quantity) =>
        set((state) => {
          const targetIndex = state.tools.findIndex((tool, index) => getRealId(tool, index) === id);
          if (targetIndex === -1) return state;

          const targetTool = state.tools[targetIndex];
          const realId = getRealId(targetTool, targetIndex);
          const currentQuantity = Math.max(toNumber(targetTool.quantity), 1);
          const requestedQuantity = quantity === undefined ? currentQuantity : Math.max(toNumber(quantity), 1);
          const assignedQuantity = Math.min(requestedQuantity, currentQuantity);
          const remainingQuantity = currentQuantity - assignedQuantity;

          const assignedTool: Tool = {
            ...targetTool,
            id: remainingQuantity > 0 ? createToolId(targetTool.name) : realId,
            quantity: String(assignedQuantity),
            holder: workerName,
            borrowedBy: workerName,
            status: "In Use",
          };

          let updatedTools: Tool[] = [];

          if (remainingQuantity > 0) {
            updatedTools = state.tools.map((tool, index) =>
              getRealId(tool, index) === realId
                ? {
                    ...tool,
                    id: realId,
                    quantity: String(remainingQuantity),
                    holder: "",
                    borrowedBy: "",
                    status: "Available",
                  }
                : tool
            );
            updatedTools.push(assignedTool);
          } else {
            updatedTools = state.tools.map((tool, index) =>
              getRealId(tool, index) === realId ? assignedTool : tool
            );
          }

          return {
            tools: updatedTools,
            historyLogs: [
              createLog({
                type: "ASSIGN",
                toolName: targetTool.name,
                quantity: String(assignedQuantity),
                workerName,
                location: targetTool.location,
                message: `${targetTool.name} x${assignedQuantity} assigned to ${workerName}`,
              }),
              ...state.historyLogs,
            ],
          };
        }),

      returnTool: (id, quantity) =>
        set((state) => {
          const targetIndex = state.tools.findIndex((tool, index) => getRealId(tool, index) === id);
          if (targetIndex === -1) return state;

          const targetTool = state.tools[targetIndex];
          const realId = getRealId(targetTool, targetIndex);
          const currentQuantity = Math.max(toNumber(targetTool.quantity), 1);
          const requestedQuantity = quantity === undefined ? currentQuantity : Math.max(toNumber(quantity), 1);
          const returnedQuantity = Math.min(requestedQuantity, currentQuantity);
          const remainingBorrowedQuantity = currentQuantity - returnedQuantity;
          const previousWorker = targetTool.borrowedBy || targetTool.holder || "";

          let updatedTools: Tool[] = [];

          if (remainingBorrowedQuantity > 0) {
            updatedTools = state.tools.map((tool, index) =>
              getRealId(tool, index) === realId
                ? {
                    ...tool,
                    id: realId,
                    quantity: String(remainingBorrowedQuantity),
                    status: "In Use",
                    borrowedBy: previousWorker,
                    holder: previousWorker,
                  }
                : tool
            );

            updatedTools.push({
              ...targetTool,
              id: createToolId(targetTool.name),
              quantity: String(returnedQuantity),
              holder: "",
              borrowedBy: "",
              status: "Available",
              location: "Warehouse",
              returnDate: new Date().toISOString(),
            });
          } else {
            updatedTools = state.tools.map((tool, index) =>
              getRealId(tool, index) === realId
                ? {
                    ...tool,
                    id: realId,
                    holder: "",
                    borrowedBy: "",
                    status: "Available",
                    location: "Warehouse",
                    returnDate: new Date().toISOString(),
                  }
                : tool
            );
          }

          return {
            tools: updatedTools,
            historyLogs: [
              createLog({
                type: "RETURN",
                toolName: targetTool.name,
                quantity: String(returnedQuantity),
                workerName: previousWorker,
                location: "Warehouse",
                message: `${targetTool.name} x${returnedQuantity} returned from ${previousWorker || "worker"}`,
              }),
              ...state.historyLogs,
            ],
          };
        }),

      setWarehouseQuantity: (toolName, quantity) =>
        set((state) => ({
          warehouseStock: { ...state.warehouseStock, [toolName]: quantity },
          historyLogs: [
            createLog({
              type: "WAREHOUSE",
              toolName,
              quantity,
              message: `${toolName} warehouse stock set to ${quantity || "0"}`,
            }),
            ...state.historyLogs,
          ],
        })),

      addCustomTool: (tool) =>
        set((state) => {
          const alreadyExists = state.customTools.some(
            (item) =>
              item.name.toLowerCase() === tool.name.toLowerCase() &&
              item.profession === tool.profession
          );

          if (alreadyExists) return state;

          return {
            customTools: [...state.customTools, tool],
            historyLogs: [
              createLog({
                type: "CUSTOM_TOOL",
                toolName: tool.name,
                message: `${tool.name} added as custom tool`,
              }),
              ...state.historyLogs,
            ],
          };
        }),

      addHistoryLog: (log) =>
        set((state) => ({ historyLogs: [createLog(log), ...state.historyLogs] })),

      deleteHistoryLog: (id) =>
        set((state) => ({
          historyLogs: state.historyLogs.filter((log) => log.id !== id),
        })),

      clearHistoryLogs: () => set(() => ({ historyLogs: [] })),

      duplicateWorkerGroup: (oldWorkerName, newWorkerName, newLocation) =>
        set((state) => {
          const toolsToCopy = state.tools.filter(
            (tool) => tool.borrowedBy === oldWorkerName || tool.holder === oldWorkerName
          );

          const copiedTools = toolsToCopy.map((tool) => ({
            ...tool,
            id: createToolId(tool.name),
            holder: newWorkerName,
            borrowedBy: newWorkerName,
            location: newLocation,
            status: "In Use",
          }));

          const logs = copiedTools.map((tool) =>
            createLog({
              type: "ASSIGN",
              toolName: tool.name,
              quantity: tool.quantity,
              workerName: newWorkerName,
              location: newLocation,
              message: `${tool.name} x${tool.quantity} copied from ${oldWorkerName} to ${newWorkerName}`,
            })
          );

          return {
            tools: [...state.tools, ...copiedTools],
            historyLogs: [...logs, ...state.historyLogs],
          };
        }),
    }),
    {
      name: "my-tools-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);