import React from "react";
import type { ReversalResult } from "../types/ledger";

interface TelemetryPanelProps {
  result: ReversalResult | null;
  loading: boolean;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  result,
  loading,
}) => {
  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#1e293b",
          borderRadius: "8px",
          color: "#38bdf8",
        }}
      >
        Procesando algoritmo en memoria RAM...
      </div>
    );
  }

  if (!result) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#1e293b",
          borderRadius: "8px",
          color: "#94a3b8",
        }}
      >
        Selecciona una operación para medir telemetría.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: result.success ? "#0f172a" : "#450a0a",
        borderRadius: "8px",
        border: `1px solid ${result.success ? "#3b82f6" : "#ef4444"}`,
        marginTop: "20px",
      }}
    >
      <h3
        style={{ color: result.success ? "#60a5fa" : "#fca5a5", marginTop: 0 }}
      >
        Telemetría: {result.algorithmUsed}
      </h3>

      {result.success ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <span style={{ color: "#94a3b8", fontSize: "0.9em" }}>
              Ticks de CPU:
            </span>
            <p
              style={{
                fontSize: "1.4em",
                fontWeight: "bold",
                margin: "5px 0",
                color: "#f8fafc",
              }}
            >
              {result.executionTimeTicks.toLocaleString()} ticks
            </p>
          </div>
          <div>
            <span style={{ color: "#94a3b8", fontSize: "0.9em" }}>
              Tiempo Transcurrido:
            </span>
            <p
              style={{
                fontSize: "1.4em",
                fontWeight: "bold",
                margin: "5px 0",
                color: "#34d399",
              }}
            >
              {result.executionTimeMs.toFixed(4)} ms
            </p>
          </div>
          <div>
            <span style={{ color: "#94a3b8", fontSize: "0.9em" }}>
              Memoria Auxiliar Heap:
            </span>
            <p
              style={{
                fontSize: "1.4em",
                fontWeight: "bold",
                margin: "5px 0",
                color: "#a78bfa",
              }}
            >
              {result.memoryAllocatedBytes} bytes (O(1))
            </p>
          </div>
          <div>
            <span style={{ color: "#94a3b8", fontSize: "0.9em" }}>
              Nodos Procesados:
            </span>
            <p
              style={{
                fontSize: "1.4em",
                fontWeight: "bold",
                margin: "5px 0",
                color: "#f8fafc",
              }}
            >
              {result.nodesProcessed.toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ color: "#fca5a5" }}>
          <p>
            <strong>ALERTA DE SISTEMA:</strong>{" "}
            {result.errorMessage ||
              "System.StackOverflowException - Proceso abortado por desbordamiento de pila"}
          </p>
        </div>
      )}
    </div>
  );
};
