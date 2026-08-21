import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document, Types } from 'mongoose';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true, getters: false },
    toObject: { virtuals: true, getters: false },
})
export class Item {
    @Prop({ type: String, required: true, trim: true, unique: true })
    @IsString({ message: 'Name must be valid.' })
    @IsNotEmpty({ message: 'Name must be provided' })
    @ApiProperty({ required: true, description: 'Item name', example: 'Widget' })
    name: string;

    @Prop({ type: String, required: false, trim: true, default: '' })
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false, description: 'Optional description', example: 'A sample item' })
    description?: string;

    @ApiProperty({ type: Date, required: false })
    createdAt: Date;

    @ApiProperty({ type: Date, required: false })
    updatedAt: Date;
}

export type ItemDocument = Item & Document<Types.ObjectId>;
export const ItemSchema = SchemaFactory.createForClass(Item);
ItemSchema.loadClass(Item);
