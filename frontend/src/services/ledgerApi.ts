import type { LedgerState, ReversalResult } from "../types/ledger";

const API_BASE_URL = "http://localhost:5171/api/ledger";

export const ledgerApi = {
  async getState(): Promise<LedgerState> {
    const response = await fetch(`${API_BASE_URL}/state`);
    if (!response.ok) throw new Error("Error al obtener estado del ledger");
    return response.json();
  },

  async populate(count: number = 100000): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/populate?count=${count}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Error al poblar el ledger");
    return response.json();
  },

  async reverse(useIterative: boolean = true): Promise<ReversalResult> {
    const response = await fetch(
      `${API_BASE_URL}/reverse?useIterative=${useIterative}`,
      {
        method: "POST",
      },
    );
    if (!response.ok) throw new Error("Error durante la reversión contable");
    return response.json();
  },

  async reset(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/reset`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Error al reiniciar el ledger");
    return response.json();
  },
};
