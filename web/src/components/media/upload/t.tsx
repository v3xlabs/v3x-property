export type AttachedMedia =
    | {
          status: 'existing-media' | 'removed';
          media_id: number;
      }
    | {
          status: 'new-media';
          media_id: number | undefined; // if the media is uploaded, this will be its id
          name?: string;
          kind?: string;
          blob?: string;
      };

export type EditItemForm = {
    name: string;
    media: AttachedMedia[];
};
