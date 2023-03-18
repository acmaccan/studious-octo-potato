import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Resolver(() => Item)
@UseGuards(JwtAuthGuard)
export class ItemsResolver {
  constructor(private readonly itemsService: ItemsService) {}

  @Mutation(() => Item, { name: 'createItem' })
  async createItem(
    @Args('createItemInput') createItemInput: CreateItemInput,
    @CurrentUser() user: User,
  ): Promise<Item> {
    return this.itemsService.create(createItemInput, user);
  }

  // @Query(() => [Item], { name: 'items' })
  // async findAll(): Promise<Item[]> {
  //   return this.itemsService.findAll();
  // }

  @Query(() => [Item], { name: 'items' })
  async findAllByUser(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<Item[]> {
    return this.itemsService.findAllByUser(user, paginationArgs, searchArgs);
  }

  // @Query(() => Item, { name: 'item' })
  // async findOne(
  //   @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  // ): Promise<Item> {
  //   return this.itemsService.findOne(id);
  // }

  @Query(() => Item, { name: 'item' })
  async findOneByUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Item> {
    return this.itemsService.findOneByUser(id, user);
  }

  // @Mutation(() => Item)
  // updateItem(
  //   @Args('updateItemInput') updateItemInput: UpdateItemInput,
  // ): Promise<Item> {
  //   return this.itemsService.update(updateItemInput.id, updateItemInput);
  // }

  @Mutation(() => Item)
  async updateItemByUser(
    @Args('updateItemInput') updateItemInput: UpdateItemInput,
    @CurrentUser() user: User,
  ): Promise<Item> {
    return this.itemsService.updateByUser(
      updateItemInput.id,
      updateItemInput,
      user,
    );
  }

  // @Mutation(() => Item)
  // removeItem(@Args('id', { type: () => ID }) id: string): Promise<Item> {
  //   return this.itemsService.remove(id);
  // }

  @Mutation(() => Item)
  async removeItemByUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Item> {
    return this.itemsService.removeByUser(id, user);
  }
}
