import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  executionTime?: number;
  sql?: string;
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

  selectedChartType: 'bar' | 'line' | 'pie' | 'table' | 'number' | null;
  setSelectedChartType: (type: 'bar' | 'line' | 'pie' | 'table' | 'number' | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      schema: [],
      setSchema: (schema) => {
        // Clear messages when schema changes (fresh start with new data)
        set({ 
          schema,
          messages: [],
          selectedChartType: null
        });
      },

      messages: [],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      clearMessages: () => set({ messages: [] }),
      isProcessing: false,
      setIsProcessing: (isProcessing) => set({ isProcessing }),

      isListening: false,
      setIsListening: (isListening) => set({ isListening }),
      isSpeaking: false,
      setIsSpeaking: (isSpeaking) => set({ isSpeaking }),

      selectedChartType: null,
      setSelectedChartType: (type) => set({ selectedChartType: type }),
    }),
    {
      name: 'university-portal-storage',
      partialize: (state) => ({
        schema: state.schema,
      }),
    }
  )
);
