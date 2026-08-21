import { CommonResponse } from 'common/class-models';

export class CountItemsResponseDto extends CommonResponse {
    data: {
        items: number;
    };
}
