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

interface ToolState {
  tools: Tool[];
  warehouseStock: Record<string, string>;
  customTools: CustomTool[];
  historyLogs: HistoryLog[];

  addTool: (tool: Tool) => void;
  updateTool: (id: string, updatedTool: Tool) => void;
  deleteTool: (id: string) => void;
  assignTool: (id: string, workerName: string) => void;
  returnTool: (id: string) => void;

  setWarehouseQuantity: (toolName: string, quantity: string) => void;

  addCustomTool: (tool: CustomTool) => void;

  addHistoryLog: (log: Omit<HistoryLog, "id" | "createdAt">) => void;

  duplicateWorkerGroup: (
    oldWorkerName: string,
    newWorkerName: string,
    newLocation: string
  ) => void;
}

const createLog = (
  log: Omit<HistoryLog, "id" | "createdAt">
): HistoryLog => ({
  ...log,
  id: `${Date.now()}-${Math.random()}`,
  createdAt: new Date().toISOString(),
});

export const useToolStore = create<ToolState>()(
  persist(
    (set) => ({
      tools: [],
      warehouseStock: {},
      customTools: [],
      historyLogs: [],

      addTool: (tool) =>
        set((state) => ({
          tools: [...state.tools, tool],
          historyLogs: [
            createLog({
              type: tool.borrowedBy || tool.holder ? "ASSIGN" : "ADD",
              toolName: tool.name,
              quantity: tool.quantity,
              workerName: tool.borrowedBy || tool.holder,
              location: tool.location,
              message: tool.borrowedBy || tool.holder
                ? `${tool.name} x${tool.quantity} assigned to ${
                    tool.borrowedBy || tool.holder
                  }`
                : `${tool.name} x${tool.quantity} added to inventory`,
            }),
            ...state.historyLogs,
          ],
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
          const toolToDelete = state.tools.find((tool, index) => {
            const realId = tool.id || `old-tool-${index}`;
            return realId === id;
          });

          return {
            tools: state.tools.filter((tool, index) => {
              const realId = tool.id || `old-tool-${index}`;
              return realId !== id;
            }),
            historyLogs: toolToDelete
              ? [
                  createLog({
                    type: "DELETE",
                    toolName: toolToDelete.name,
                    quantity: toolToDelete.quantity,
                    workerName:
                      toolToDelete.borrowedBy || toolToDelete.holder,
                    location: toolToDelete.location,
                    message: `${toolToDelete.name} deleted`,
                  }),
                  ...state.historyLogs,
                ]
              : state.historyLogs,
          };
        }),

      assignTool: (id, workerName) =>
        set((state) => {
          let assignedTool: Tool | undefined;

          const updatedTools = state.tools.map((tool, index) => {
            const realId = tool.id || `old-tool-${index}`;

            if (realId === id) {
              assignedTool = {
                ...tool,
                holder: workerName,
                borrowedBy: workerName,
                status: "In Use",
              };

              return assignedTool;
            }

            return tool;
          });

          return {
            tools: updatedTools,
            historyLogs: assignedTool
              ? [
                  createLog({
                    type: "ASSIGN",
                    toolName: assignedTool.name,
                    quantity: assignedTool.quantity,
                    workerName,
                    location: assignedTool.location,
                    message: `${assignedTool.name} x${assignedTool.quantity} assigned to ${workerName}`,
                  }),
                  ...state.historyLogs,
                ]
              : state.historyLogs,
          };
        }),

      returnTool: (id) =>
        set((state) => {
          let returnedTool: Tool | undefined;
          let previousWorker = "";

          const updatedTools = state.tools.map((tool, index) => {
            const realId = tool.id || `old-tool-${index}`;

            if (realId === id) {
              previousWorker = tool.borrowedBy || tool.holder || "";

              returnedTool = {
                ...tool,
                id: realId,
                holder: "",
                borrowedBy: "",
                status: "Available",
                location: "Warehouse",
                returnDate: new Date().toISOString(),
              };

              return returnedTool;
            }

            return tool;
          });

          return {
            tools: updatedTools,
            historyLogs: returnedTool
              ? [
                  createLog({
                    type: "RETURN",
                    toolName: returnedTool.name,
                    quantity: returnedTool.quantity,
                    workerName: previousWorker,
                    location: "Warehouse",
                    message: `${returnedTool.name} x${returnedTool.quantity} returned from ${
                      previousWorker || "worker"
                    }`,
                  }),
                  ...state.historyLogs,
                ]
              : state.historyLogs,
          };
        }),

      setWarehouseQuantity: (toolName, quantity) =>
        set((state) => ({
          warehouseStock: {
            ...state.warehouseStock,
            [toolName]: quantity,
          },
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

          if (alreadyExists) {
            return state;
          }

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
        set((state) => ({
          historyLogs: [createLog(log), ...state.historyLogs],
        })),

      duplicateWorkerGroup: (oldWorkerName, newWorkerName, newLocation) =>
        set((state) => {
          const toolsToCopy = state.tools.filter(
            (tool) =>
              tool.borrowedBy === oldWorkerName ||
              tool.holder === oldWorkerName
          );

          const copiedTools = toolsToCopy.map((tool) => ({
            ...tool,
            id: `${Date.now()}-${Math.random()}-${tool.name}`,
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