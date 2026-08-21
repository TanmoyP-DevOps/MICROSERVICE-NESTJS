import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { MESSAGES } from 'common/microservices/messages';
import { MICROSERVICE } from 'common/constants/global';
import { ParsedQs } from 'qs';
import {
    CountItemsResponseDto,
    CreateItemRequestDto,
    CreateItemResponseDto,
    DeleteItemByIdResponseDto,
    FindItemByIdResponseDto,
    ListItemResponseDto,
    UpdateItemByIdResponseDto,
    UpdateItemDto,
} from './dto';
import {
    ItemByIdRequestDto,
    ItemByIdResponseDto,
    ItemDeleteByIdRequestDto,
    ItemDeleteByIdResponseDto,
    ItemsCountRequestDto,
    ItemsCountResponseDto,
    ItemsCreateRequestDto,
    ItemsCreateResponseDto,
    ItemsListDto,
    ItemsListRequestDto,
    ItemUpdateRequestDto,
    ItemUpdateResponseDto,
} from 'common/microservices/services/items/dto';

@Injectable()
export class ItemsService {
    constructor(@Inject(MICROSERVICE.ITEMS) private readonly itemsClient: ClientProxy) {}

    async create(dto: CreateItemRequestDto): Promise<CreateItemResponseDto> {
        const createDto: ItemsCreateRequestDto = {
            name: dto.name,
            description: dto.description,
        };
        const response = await lastValueFrom(
            this.itemsClient.send<ItemsCreateResponseDto>(MESSAGES.ITEMS.CREATE, createDto),
        );
        return { data: { item: response.item } };
    }

    async list(query?: ParsedQs): Promise<ListItemResponseDto> {
        const result = await lastValueFrom(
            this.itemsClient.send<ItemsListDto>(MESSAGES.ITEMS.LIST, { query } as ItemsListRequestDto),
        );
        return { data: { items: result.items } };
    }

    async findById(_id: string): Promise<FindItemByIdResponseDto> {
        const result = await lastValueFrom(
            this.itemsClient.send<ItemByIdResponseDto>(MESSAGES.ITEMS.FIND_BY_ID, { _id } as ItemByIdRequestDto),
        );
        return { data: { item: result.item } };
    }

    async update(_id: string, dto: UpdateItemDto): Promise<UpdateItemByIdResponseDto> {
        const result = await lastValueFrom(
            this.itemsClient.send<ItemUpdateResponseDto>(MESSAGES.ITEMS.UPDATE, {
                _id,
                payload: dto,
            } as ItemUpdateRequestDto),
        );
        return { data: { item: result.item } };
    }

    async count(query: ParsedQs): Promise<CountItemsResponseDto> {
        const result = await lastValueFrom(
            this.itemsClient.send<ItemsCountResponseDto>(MESSAGES.ITEMS.COUNT, { query } as ItemsCountRequestDto),
        );
        return { data: { items: result.items } };
    }

    async delete(_id: string): Promise<DeleteItemByIdResponseDto> {
        const result = await lastValueFrom(
            this.itemsClient.send<ItemDeleteByIdResponseDto>(MESSAGES.ITEMS.DELETE, {
                _id,
            } as ItemDeleteByIdRequestDto),
        );
        return { data: { item: result.item } };
    }
}
