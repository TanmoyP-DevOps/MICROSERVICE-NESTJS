import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Item, ItemDocument } from 'database/schemas';
import { QueryFilter, Model } from 'mongoose';
import {
    ItemByIdResponseDto,
    ItemDeleteByIdRequestDto,
    ItemDeleteByIdResponseDto,
    ItemFindOneDto,
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
    constructor(@InjectModel(Item.name) private itemModel: Model<ItemDocument>) {}

    async exists(filter: QueryFilter<ItemDocument>): Promise<Pick<ItemDocument, '_id'>> {
        return this.itemModel.exists(filter);
    }

    async create(dto: ItemsCreateRequestDto): Promise<ItemsCreateResponseDto> {
        const item = await this.itemModel.create(dto);
        return { item };
    }

    async list(dto: ItemsListRequestDto): Promise<ItemsListDto> {
        const filter = (dto.query?.filter as QueryFilter<ItemDocument>) || {};
        const items = await this.itemModel.find(filter).exec();
        return { items };
    }

    async count(dto: ItemsCountRequestDto): Promise<ItemsCountResponseDto> {
        const filter = (dto.query?.filter as QueryFilter<ItemDocument>) || {};
        const items = await this.itemModel.countDocuments(filter).exec();
        return { items };
    }

    async findById(id: string): Promise<ItemByIdResponseDto> {
        const item = await this.itemModel.findById(id).exec();
        return { item };
    }

    async findOne(findQuery: QueryFilter<ItemDocument>): Promise<ItemFindOneDto> {
        const item = await this.itemModel.findOne(findQuery);
        return { item };
    }

    async update(dto: ItemUpdateRequestDto): Promise<ItemUpdateResponseDto> {
        const item = await this.itemModel.findByIdAndUpdate(dto._id, dto.payload, {
            returnDocument: 'after',
        });
        return { item };
    }

    async findByIdAndDelete(dto: ItemDeleteByIdRequestDto): Promise<ItemDeleteByIdResponseDto> {
        const item = await this.itemModel.findByIdAndDelete(dto._id);
        return { item };
    }
}
