import { create } from "zustand";

type CursorState = {
  x: number | null;
  y: number | null;
  set: (x: number, y: number) => void;
};

export const useCursor = create<CursorState>((set) => ({
  x: null,
  y: null,
  set: (x, y) => set({ x, y }),
}));
