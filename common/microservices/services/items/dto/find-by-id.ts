import { ItemDocument } from 'database/schemas';
import { ParsedQs } from 'qs';

export class ItemByIdResponseDto {
    item: ItemDocument;
}

export class ItemByIdRequestDto {
    _id: string;
    query?: ParsedQs;
}
