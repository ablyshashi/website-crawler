export interface Chunk {
  id: string;

  text: string;

  index: number;

  metadata: {
    url: string;

    title: string;
  };
}
