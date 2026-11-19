export interface LedgerState {
  totalCount: number;
  headValue: number | null;
  sampleValues: number[];
}

export interface ReversalResult {
  algorithmUsed: string;
  executionTimeTicks: number;
  executionTimeMs: number;
  memoryAllocatedBytes: number;
  nodesProcessed: number;
  success: boolean;
  errorMessage?: string;
}
