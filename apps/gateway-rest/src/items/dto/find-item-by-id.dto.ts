import { CommonResponse } from 'common/class-models';
import { ItemDocument } from 'database/schemas';

export class FindItemByIdResponseDto extends CommonResponse {
    data: {
        item: ItemDocument;
    };
}
