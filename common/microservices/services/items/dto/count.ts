import { CountStandardRequest, CountStandardResponse } from 'common/microservices/dto-standards';
import { ParsedQs } from 'qs';

export class ItemsCountResponseDto extends CountStandardResponse {
    items: number;
}

export class ItemsCountRequestDto extends CountStandardRequest {
    query: ParsedQs;
}
