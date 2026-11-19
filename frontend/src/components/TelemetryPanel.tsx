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
          backgroundColor: "#f5f8ff",
          borderRadius: "8px",
          color: "#1d607c",
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
          backgroundColor: "#f5f8ff",
          borderRadius: "8px",
          color: "#5c5f64",
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
        backgroundColor: result.success ? "#f5f8ff" : "#ffcfcf",
        borderRadius: "8px",
        border: `1px solid ${result.success ? "#b0b3b8" : "#dba4a4"}`,
        marginTop: "20px",
      }}
    >
      <h3
        style={{ color: result.success ? "#1559ac" : "#700000", marginTop: 0 }}
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
            <span style={{ color: "#333333", fontSize: "0.9em" }}>
              Ticks de CPU:
            </span>
            <p
              style={{
                fontSize: "1.4em",
                fontWeight: "bold",
                margin: "5px 0",
                color: "#535353",
              }}
            >
              {result.executionTimeTicks.toLocaleString()} ticks
            </p>
          </div>
          <div>
            <span style={{ color: "#333333", fontSize: "0.9em" }}>
              Tiempo Transcurrido:
            </span>
            <p
              style={{
                fontSize: "1.4em",
                fontWeight: "bold",
                margin: "5px 0",
                color: "#18805a",
              }}
            >
              {result.executionTimeMs.toFixed(4)} ms
            </p>
          </div>
          <div>
            <span style={{ color: "#333333", fontSize: "0.9em" }}>
              Memoria Auxiliar Heap:
            </span>
            <p
              style={{
                fontSize: "1.4em",
                fontWeight: "bold",
                margin: "5px 0",
                color: "#5d3fb6",
              }}
            >
              {result.memoryAllocatedBytes} bytes (O(1))
            </p>
          </div>
          <div>
            <span style={{ color: "#333333", fontSize: "0.9em" }}>
              Nodos Procesados:
            </span>
            <p
              style={{
                fontSize: "1.4em",
                fontWeight: "bold",
                margin: "5px 0",
                color: "#535353",
              }}
            >
              {result.nodesProcessed.toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ color: "#b42121" }}>
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
