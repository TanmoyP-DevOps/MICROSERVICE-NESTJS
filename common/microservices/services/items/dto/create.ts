import { ItemDocument } from 'database/schemas';

export class ItemsCreateRequestDto {
    name: string;
    description?: string;
}

export class ItemsCreateResponseDto {
    item: ItemDocument;
}
