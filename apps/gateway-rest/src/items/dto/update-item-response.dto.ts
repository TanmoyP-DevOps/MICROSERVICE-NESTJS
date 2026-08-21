import { CommonResponse } from 'common/class-models';
import { ItemDocument } from 'database/schemas';

export class UpdateItemByIdResponseDto extends CommonResponse {
    data: {
        item: ItemDocument;
    };
}
