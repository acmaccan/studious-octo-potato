import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  Int,
} from '@nestjs/graphql';
import { ListsService } from './lists.service';
import { List } from './entities/list.entity';
import { CreateListInput, UpdateListInput } from './dto/inputs/';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';
import { ListItem } from '../list-item/entities/list-item.entity';
import { ListItemService } from '../list-item/list-item.service';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListsResolver {
  constructor(
    private readonly listsService: ListsService,
    private readonly listItemService: ListItemService,
  ) {}

  @Mutation(() => List, { name: 'createList' })
  async createList(
    @Args('createListInput') createListInput: CreateListInput,
    @CurrentUser() user: User,
  ): Promise<List> {
    return this.listsService.create(createListInput, user);
  }

  @Query(() => [List], { name: 'lists' })
  async findAllByUser(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<List[]> {
    return this.listsService.findAllByUser(user, paginationArgs, searchArgs);
  }

  @Query(() => List, { name: 'list' })
  async findOneByUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<List> {
    return this.listsService.findOneByUser(id, user);
  }

  @Mutation(() => List)
  async updateListByUser(
    @Args('updateListInput') updateListInput: UpdateListInput,
    @CurrentUser() user: User,
  ): Promise<List> {
    return this.listsService.updateByUser(
      updateListInput.id,
      updateListInput,
      user,
    );
  }

  @Mutation(() => List)
  async removeListByUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<List> {
    return this.listsService.removeByUser(id, user);
  }

  @ResolveField(() => [ListItem], { name: 'products' })
  async getListItems(
    @Parent() list: List,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    return this.listItemService.findAll(list, paginationArgs, searchArgs);
  }

  @ResolveField(() => Int, { name: 'listItemsCount' })
  async countListItemByList(@Parent() list: List): Promise<number> {
    return this.listItemService.listItemCountByList(list);
  }
}
