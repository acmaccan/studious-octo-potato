import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ValidRolesArgs } from './dto/args/roles.args';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { ItemsService } from '../items/items.service';
import { Item } from '../items/entities/item.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args/';
import { ListsService } from '../lists/lists.service';
import { List } from '../lists/entities/list.entity';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
  ) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @Args() validRoles: ValidRolesArgs,
    @CurrentUser([ValidRoles.admin]) user: User,
  ): Promise<User[]> {
    return this.usersService.findAll(validRoles.roles);
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin]) user: User,
  ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Query(() => User, { name: 'updateUser' })
  async update(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser([ValidRoles.admin]) updateBy: User,
  ): Promise<User> {
    return this.usersService.update(updateUserInput, updateBy);
  }

  @Mutation(() => User, { name: 'blockUser' })
  blockUser(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser([ValidRoles.admin]) updateBy: User,
  ): Promise<User> {
    return this.usersService.block(id, updateBy);
  }

  @ResolveField(() => Int, { name: 'itemCount' })
  async itemCount(
    @CurrentUser([ValidRoles.admin]) queryBy: User,
    @Parent() user: User,
  ): Promise<number> {
    return this.itemsService.itemsCountByUser(user);
  }

  @ResolveField(() => [Item], { name: 'items' })
  async getItemsByUser(
    @CurrentUser([ValidRoles.admin]) queryBy: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<Item[]> {
    return this.itemsService.findAllByUser(user, paginationArgs, searchArgs);
  }

  @ResolveField(() => Int, { name: 'listCount' })
  async listCount(
    @CurrentUser([ValidRoles.admin]) queryBy: User,
    @Parent() user: User,
  ): Promise<number> {
    return this.listsService.listsCountByUser(user);
  }

  @ResolveField(() => [List], { name: 'lists' })
  async getListsByUser(
    @CurrentUser([ValidRoles.admin]) queryBy: User,
    @Parent() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs,
  ): Promise<List[]> {
    return this.listsService.findAllByUser(user, paginationArgs, searchArgs);
  }
}
