import { ItemDocument } from 'database/schemas';

export class ItemUpdateResponseDto {
    item: ItemDocument;
}

export class ItemUpdateRequestDto {
    _id: string;
    payload: {
        name?: string;
        description?: string;
    };
}
