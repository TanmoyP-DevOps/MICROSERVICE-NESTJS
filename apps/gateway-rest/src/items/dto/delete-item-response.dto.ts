import { CommonResponse } from 'common/class-models';
import { ItemDocument } from 'database/schemas';

export class DeleteItemByIdResponseDto extends CommonResponse {
    data: {
        item: ItemDocument;
    };
}
