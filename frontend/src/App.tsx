import { useState, useEffect } from "react";
import { ledgerApi } from "./services/ledgerApi";
import type { LedgerState, ReversalResult } from "./types/ledger";
import { TelemetryPanel } from "./components/TelemetryPanel";

export function App() {
  const [state, setState] = useState<LedgerState | null>(null);
  const [telemetry, setTelemetry] = useState<ReversalResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [nodeCount, setNodeCount] = useState<number>(100000);

  const fetchState = async () => {
    try {
      const data = await ledgerApi.getState();
      setState(data);
    } catch (err) {
      console.error("Error conectando al backend:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    ledgerApi
      .getState()
      .then((data) => {
        if (isMounted) {
          setState(data);
        }
      })
      .catch((err) => {
        console.error("Error conectando al backend:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePopulate = async () => {
    setLoading(true);
    try {
      await ledgerApi.populate(nodeCount);
      await fetchState();
    } finally {
      setLoading(false);
    }
  };

  const handleReverseIterative = async () => {
    setLoading(true);
    try {
      const res = await ledgerApi.reverse(true);
      setTelemetry(res);
      await fetchState();
    } finally {
      setLoading(false);
    }
  };

  const handleReverseRecursive = async () => {
    setLoading(true);
    try {
      const res = await ledgerApi.reverse(false);
      setTelemetry(res);
      await fetchState();
    } catch {
      setTelemetry({
        algorithmUsed: "Recursivo (Legacy)",
        executionTimeTicks: 0,
        executionTimeMs: 0,
        memoryAllocatedBytes: 0,
        nodesProcessed: state?.totalCount || 0,
        success: false,
        errorMessage:
          "System.StackOverflowException - La pila de llamadas del servidor colapsó al procesar los nodos recursivamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await ledgerApi.reset();
      setTelemetry(null);
      await fetchState();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>Financial Ledger & Audit Reversal Engine</h1>
      <p style={{ color: "#5c5f64" }}>
        Panel de Telemetría para Comparación de Algoritmos de Inversión Contable
        en Tiempo Real (.NET 8 + React 19).
      </p>

      <div
        style={{
          padding: "20px",
          backgroundColor: "#f5f8ff",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2>Estado Actual del Ledger (RAM)</h2>
        <p>
          <strong>Total de Nodos:</strong>{" "}
          {state?.totalCount.toLocaleString() ?? 0}
        </p>
        <p>
          <strong>Valor en Cabeza (Head):</strong>{" "}
          {state?.headValue !== null && state?.headValue !== undefined
            ? state.headValue
            : "Lista Vacía"}
        </p>
        <p>
          <strong>Muestra de Primeros Nodos:</strong>{" "}
          {state?.sampleValues.join(" -> ") || "N/A"}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <input
          type="number"
          value={nodeCount}
          onChange={(e) => setNodeCount(Number(e.target.value))}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #475569",
            backgroundColor: "#f5f8ff",
            color: "#333333",
          }}
        />
        <button
          onClick={handlePopulate}
          disabled={loading}
          style={{
            padding: "10px 15px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Poblar Ledger
        </button>
        <button
          onClick={handleReverseIterative}
          disabled={loading || !state?.totalCount}
          style={{
            padding: "10px 15px",
            backgroundColor: "#059669",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Reversión Iterativa (3 Punteros O(1))
        </button>
        <button
          onClick={handleReverseRecursive}
          disabled={loading || !state?.totalCount}
          style={{
            padding: "10px 15px",
            backgroundColor: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Reversión Recursiva (Crash Test)
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          style={{
            padding: "10px 15px",
            backgroundColor: "#475569",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Vaciar
        </button>
      </div>

      <TelemetryPanel result={telemetry} loading={loading} />
    </div>
  );
}
