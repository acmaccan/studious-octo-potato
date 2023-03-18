import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateListInput } from './';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateListInput extends PartialType(CreateListInput) {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
