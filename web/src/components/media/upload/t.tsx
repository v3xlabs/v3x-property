export type AttachedMedia = {
    status: 'existing-media' | 'new-media' | 'removed';
    media_id: number;
    // description: string;
    // url: string; // url to the media
    // kind: string; // 'png'
};

export type EditItemForm = {
    name: string;
    media: AttachedMedia[];
};
