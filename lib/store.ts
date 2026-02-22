import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgres';
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  ssl: boolean;
  isMock?: boolean;
}

export interface TableSchema {
  tableName: string;
  columns: {
    name: string;
    type: string;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
  }[];
}

export interface QueryResult {
  columns: string[];
  rows: any[];
  executionTime: number;
  sql: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  relatedQuery?: QueryResult;
  chartType?: 'bar' | 'line' | 'pie' | 'table' | 'number';
  chartConfig?: any;
}

interface AppState {
  connection: DatabaseConnection | null;
  setConnection: (conn: DatabaseConnection | null) => void;

  schema: TableSchema[];
  setSchema: (schema: TableSchema[]) => void;

  messages: Message[];
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;

  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  isSpeaking: boolean;
  setIsSpeaking: (isSpeaking: boolean) => void;

  activeView: 'dashboard' | 'connection';
  setActiveView: (view: 'dashboard' | 'connection') => void;

  selectedChartType: 'bar' | 'line' | 'pie' | 'table' | 'number' | null;
  setSelectedChartType: (type: 'bar' | 'line' | 'pie' | 'table' | 'number' | null) => void;

  viewMode: 'chart' | 'table';
  setViewMode: (mode: 'chart' | 'table') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      connection: null,
      setConnection: (conn) => {
        // Clear messages when database connection changes (start fresh conversation)
        set({ 
          connection: conn,
          messages: [], // Clear previous conversation
          selectedChartType: null // Reset chart selection
        });
      },

      schema: [],
      setSchema: (schema) => set({ schema }),

      messages: [],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      clearMessages: () => set({ messages: [] }),
      isProcessing: false,
      setIsProcessing: (isProcessing) => set({ isProcessing }),

      isListening: false,
      setIsListening: (isListening) => set({ isListening }),
      isSpeaking: false,
      setIsSpeaking: (isSpeaking) => set({ isSpeaking }),

      activeView: 'connection',
      setActiveView: (view) => set({ activeView: view }),

      selectedChartType: null,
      setSelectedChartType: (type) => set({ selectedChartType: type }),

      viewMode: 'chart',
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'datavoice-storage',
      partialize: (state) => ({
        connection: state.connection,
        schema: state.schema,
      }),
    }
  )
);
