import { CommonResponse } from 'common/class-models';
import { PickType } from '@nestjs/swagger';
import { Item, ItemDocument } from 'database/schemas';

export class CreateItemResponseDto extends CommonResponse {
    data: {
        item: ItemDocument;
    };
}

export class CreateItemRequestDto extends PickType(Item, ['name', 'description'] as const) {}
