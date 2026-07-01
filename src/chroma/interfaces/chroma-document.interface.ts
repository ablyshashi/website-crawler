export interface ChromaDocument {
  id: string;
  document: string;
  embedding: number[];
  metadata: Record<string, any>;
}
