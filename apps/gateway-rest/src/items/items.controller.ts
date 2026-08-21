import { Body, Controller, Delete, Get, Logger, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { API_ENDPOINTS } from 'common/microservices/services/gateway-rest/rest-routes';
import { API_VERSIONS } from 'common/microservices/services/gateway-rest/constants';
import { ParsedQs } from 'qs';
import { ItemsService } from './items.service';
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
import { ITEMS_MESSAGES } from 'common/microservices/services/items/constants';
import { LoggerStandardContextDto } from 'common/microservices/dto-standards';

@Controller({
    version: API_VERSIONS.V1,
})
@ApiTags('Items')
export class ItemsController {
    private readonly logger = new Logger(ItemsController.name);
    private loggerContext: LoggerStandardContextDto = { source: ItemsController.name, data: null };

    constructor(private readonly itemsService: ItemsService) {}

    @Post(API_ENDPOINTS.ITEMS.BASE)
    @ApiOperation({ summary: 'Create a new item' })
    async create(@Body() dto: CreateItemRequestDto): Promise<CreateItemResponseDto> {
        this.loggerContext.data = { dto };
        this.logger.log('CREATING ITEM...', this.loggerContext);
        return this.itemsService.create(dto);
    }

    @Get(API_ENDPOINTS.ITEMS.BASE)
    @ApiOperation({ summary: 'List items' })
    async list(@Query() query?: ParsedQs): Promise<ListItemResponseDto> {
        this.loggerContext.data = { query };
        this.logger.log('LISTING ITEMS...', this.loggerContext);
        return this.itemsService.list(query);
    }

    @Get(API_ENDPOINTS.ITEMS.COUNT)
    @ApiOperation({ summary: 'Count items' })
    async count(@Query() query?: ParsedQs): Promise<CountItemsResponseDto> {
        this.loggerContext.data = { query };
        this.logger.log('COUNTING ITEMS...', this.loggerContext);
        return this.itemsService.count(query);
    }

    @Get(API_ENDPOINTS.ITEMS.BY_ID)
    @ApiOperation({ summary: 'Find item by id' })
    @ApiParam({ name: '_id', type: String, required: true })
    async findById(@Param('_id') _id: string): Promise<FindItemByIdResponseDto> {
        this.loggerContext.data = { _id };
        this.logger.log('FINDING ITEM BY ID...', this.loggerContext);
        const item = await this.itemsService.findById(_id);
        if (!item.data.item) {
            throw new NotFoundException(ITEMS_MESSAGES.NOT_FOUND);
        }
        return item;
    }

    @Patch(API_ENDPOINTS.ITEMS.BY_ID)
    @ApiOperation({ summary: 'Update item by id' })
    @ApiParam({ name: '_id', type: String, required: true })
    async update(@Param('_id') _id: string, @Body() dto: UpdateItemDto): Promise<UpdateItemByIdResponseDto> {
        this.loggerContext.data = { _id, dto };
        this.logger.log('UPDATING ITEM...', this.loggerContext);
        const exists = await this.itemsService.findById(_id);
        if (!exists.data.item) {
            throw new NotFoundException(ITEMS_MESSAGES.NOT_FOUND);
        }
        return this.itemsService.update(_id, dto);
    }

    @Delete(API_ENDPOINTS.ITEMS.BY_ID)
    @ApiOperation({ summary: 'Delete item by id' })
    @ApiParam({ name: '_id', type: String, required: true })
    async delete(@Param('_id') _id: string): Promise<DeleteItemByIdResponseDto> {
        this.loggerContext.data = { _id };
        this.logger.log('DELETING ITEM...', this.loggerContext);
        const exists = await this.itemsService.findById(_id);
        if (!exists.data.item) {
            throw new NotFoundException(ITEMS_MESSAGES.NOT_FOUND);
        }
        return this.itemsService.delete(_id);
    }
}
