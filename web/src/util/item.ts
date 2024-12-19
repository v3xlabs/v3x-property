import { components } from '@/api/schema.gen';

export type Item = components['schemas']['Item'];
export type ItemUpdatePayload = components['schemas']['ItemUpdatePayload'];
export type ItemField = components['schemas']['ItemUpdateFieldPayload'];

export const fromItemToForm = (
    item: Item,
    item_fields: ItemField[],
    item_media?: number[]
): ItemUpdatePayload => {
    return {
        name: item.name ?? '',
        media:
            item_media?.map((media_id) => ({
                status: 'existing-media',
                media_id,
            })) ?? [],
        fields: item_fields,
    };
};

export const itemDiff = (
    item: ItemUpdatePayload,
    base: ItemUpdatePayload
): ItemUpdatePayload => {
    const fields =
        item.fields?.filter(
            (field) =>
                field.definition_id !==
                    base.fields?.find(
                        (f) => f.definition_id === field.definition_id
                    )?.definition_id ||
                field.value !==
                    base.fields?.find(
                        (f) => f.definition_id === field.definition_id
                    )?.value
            // TODO: implement field deletion
        ) ?? [];

    const media = item.media?.filter((m) => m.status !== 'existing-media');

    //
    return {
        name: item.name !== base.name ? item.name : undefined,
        location_id:
            item.location_id !== base.location_id
                ? item.location_id
                : undefined,
        owner_id: item.owner_id !== base.owner_id ? item.owner_id : undefined,
        product_id:
            item.product_id !== base.product_id ? item.product_id : undefined,
        fields,
        media,
        tags: item.tags !== base.tags ? item.tags : undefined,
    };
};

export const isEmptyDiff = (diff: ItemUpdatePayload): boolean => {
    return Object.values(diff).every(
        (value) =>
            value === undefined || (Array.isArray(value) && value.length === 0)
    );
};
