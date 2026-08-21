import { Controller } from '@nestjs/common';
import { ItemsService } from './items.service';
import { MessagePattern } from '@nestjs/microservices';
import { MESSAGES } from 'common/microservices';
import {
    ItemByIdRequestDto,
    ItemByIdResponseDto,
    ItemDeleteByIdRequestDto,
    ItemDeleteByIdResponseDto,
    ItemFindOneDto,
    ItemsCountRequestDto,
    ItemsCountResponseDto,
    ItemsCreateRequestDto,
    ItemsCreateResponseDto,
    ItemsFindOneRequestDto,
    ItemsListDto,
    ItemsListRequestDto,
    ItemUpdateRequestDto,
    ItemUpdateResponseDto,
} from 'common/microservices/services/items/dto';
import { QueryFilter } from 'mongoose';
import { ItemDocument } from 'database/schemas';

@Controller()
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) {}

    @MessagePattern(MESSAGES.ITEMS.CREATE)
    async create(dto: ItemsCreateRequestDto): Promise<ItemsCreateResponseDto> {
        return await this.itemsService.create(dto);
    }

    @MessagePattern(MESSAGES.ITEMS.LIST)
    async list(dto: ItemsListRequestDto): Promise<ItemsListDto> {
        return this.itemsService.list(dto);
    }

    @MessagePattern(MESSAGES.ITEMS.FIND_ONE)
    async findOne(dto: ItemsFindOneRequestDto): Promise<ItemFindOneDto> {
        return this.itemsService.findOne(dto.filter);
    }

    @MessagePattern(MESSAGES.ITEMS.FIND_BY_ID)
    async findById(dto: ItemByIdRequestDto): Promise<ItemByIdResponseDto> {
        return this.itemsService.findById(dto._id);
    }

    @MessagePattern(MESSAGES.ITEMS.COUNT)
    async count(dto: ItemsCountRequestDto): Promise<ItemsCountResponseDto> {
        return this.itemsService.count(dto);
    }

    @MessagePattern(MESSAGES.ITEMS.UPDATE)
    async update(dto: ItemUpdateRequestDto): Promise<ItemUpdateResponseDto> {
        return this.itemsService.update(dto);
    }

    @MessagePattern(MESSAGES.ITEMS.DELETE)
    async delete(dto: ItemDeleteByIdRequestDto): Promise<ItemDeleteByIdResponseDto> {
        return this.itemsService.findByIdAndDelete(dto);
    }

    @MessagePattern(MESSAGES.ITEMS.EXIST)
    async exists(filter: QueryFilter<ItemDocument>): Promise<Pick<ItemDocument, '_id'>> {
        return this.itemsService.exists(filter);
    }
}
