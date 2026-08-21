import { ItemDocument } from 'database/schemas';

export class ItemDeleteByIdResponseDto {
    item: ItemDocument;
}

export class ItemDeleteByIdRequestDto {
    _id: string;
}
