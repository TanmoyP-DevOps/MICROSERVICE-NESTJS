import { PartialType, PickType } from '@nestjs/swagger';
import { Item } from 'database/schemas';

export class UpdateItemDto extends PartialType(PickType(Item, ['name', 'description'] as const)) {}
