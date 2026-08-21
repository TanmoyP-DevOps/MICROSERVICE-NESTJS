import { CommonResponse } from 'common/class-models';
import { ItemDocument } from 'database/schemas';

export class ListItemResponseDto extends CommonResponse {
    data: {
        items: Array<ItemDocument>;
    };
}
