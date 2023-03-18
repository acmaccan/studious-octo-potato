import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true })
  @Min(0)
  @IsOptional()
  // Its optional for the user, but always has a value.
  offset = 0;

  @Field(() => Int, { nullable: true })
  @Min(1)
  @IsOptional()
  // Its optional for the user, but always has a value.
  limit = 10;
}
