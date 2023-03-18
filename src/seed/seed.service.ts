import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { SEED_USERS, SEED_ITEMS, SEED_LISTS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ListItem } from '../list-item/entities/list-item.entity';
import { List } from '../lists/entities/list.entity';
import { ListsService } from '../lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';

@Injectable()
export class SeedService {
  private isDevelopmentEnvironment: boolean;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,

    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,

    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly usersService: UsersService,

    private readonly itemsService: ItemsService,

    private readonly listsService: ListsService,

    private readonly listItemService: ListItemService,
  ) {
    this.isDevelopmentEnvironment =
      configService.get('STATE') === 'development';
  }

  async executeSeed() {
    // Verify if we are in development
    if (!this.isDevelopmentEnvironment) {
      throw new UnauthorizedException(
        'We only run SEED in development environment',
      );
    }

    // Clear databaase
    await this.deleteDatabaseRegistries();

    // Load users without ids or relations
    const user = await this.loadUsers();

    // Load items with whos running the seed id
    await this.loadItems(user);

    // Load lists
    const list = await this.loadLists(user);

    // Load listItems
    const items = await this.itemsService.findAllByUser(
      user,
      { limit: 15, offset: 0 },
      {},
    );
    await this.loadListItems(list, items);

    return true;
  }

  async deleteDatabaseRegistries() {
    // First remove listItems
    await this.listItemRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Second remove lists
    await this.listsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Then remove items
    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Then remove users
    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  async loadUsers(): Promise<User> {
    const users = [];

    for (const user of SEED_USERS) {
      users.push(await this.usersService.create(user));
    }

    return users[0];
  }

  async loadItems(user: User): Promise<void> {
    const itemsPromises = [];

    for (const item of SEED_ITEMS) {
      itemsPromises.push(this.itemsService.create(item, user));
    }

    await Promise.all(itemsPromises);
  }

  async loadLists(user: User): Promise<List> {
    const lists = [];

    for (const list of SEED_LISTS) {
      lists.push(await this.listsService.create(list, user));
    }

    return lists[0];
  }

  async loadListItems(list: List, items: Item[]): Promise<void> {
    const listItemsPromises = [];

    for (const item of items) {
      listItemsPromises.push(
        this.listItemService.create({
          quantity: Math.round(Math.random() * 10),
          completed: !!Math.round(Math.random() * 1),
          listId: list.id,
          itemId: item.id,
        }),
      );
    }

    await Promise.all(listItemsPromises);
  }
}
