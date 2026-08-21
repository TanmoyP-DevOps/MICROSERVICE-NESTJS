import { ParsedQs } from 'qs';

export class CountStandardRequest {
    query: ParsedQs;
    [key: string]: string | ParsedQs;
}

export class CountStandardResponse {
    [key: string]: number;
}
