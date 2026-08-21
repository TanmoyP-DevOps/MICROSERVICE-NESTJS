import { ItemDocument } from 'database/schemas';
import { QueryFilter } from 'mongoose';
import { ParsedQs } from 'qs';

export class ItemsListDto {
    items: Array<ItemDocument>;
}

export class ItemFindOneDto {
    item: ItemDocument;
}

export class ItemsListRequestDto {
    query: ParsedQs;
}

export class ItemsFindOneRequestDto {
    filter: QueryFilter<ItemDocument>;
}
