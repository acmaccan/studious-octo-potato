import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput, UpdateListItemInput } from './dto/inputs';
import { InjectRepository } from '@nestjs/typeorm';
import { ListItem } from './entities/list-item.entity';
import { Repository } from 'typeorm';
import { List } from '../lists/entities/list.entity';
import { PaginationArgs } from '../common/dto/args/pagination.args';
import { SearchArgs } from '../common/dto/args/search.args';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
  ) {}

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    // Los objetos a ser insertados, en este punto no son objetos
    // const newListItem = this.listItemRepository.create(createListItemInput);

    // Entonces:
    const { itemId, listId, ...rest } = createListItemInput;

    const newListItem = this.listItemRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId },
    });
    await this.listItemRepository.save(newListItem);
    return this.findOne(newListItem.id);
  }

  async findAll(
    list: List,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemRepository
      .createQueryBuilder('listItem')
      .innerJoin('listItem.item', 'item')
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });

    if (search) {
      queryBuilder.andWhere('LOWER(item.name) like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async listItemCountByList(list: List): Promise<number> {
    return this.listItemRepository.count({ where: { list: { id: list.id } } });
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = this.listItemRepository.findOneBy({ id });
    if (!listItem)
      throw new NotFoundException(`List item with id ${id} not found`);
    return listItem;
  }

  async update(
    id: string,
    updateListItemInput: UpdateListItemInput,
  ): Promise<ListItem> {
    // If we need to move items to another list
    const { listId, itemId, ...rest } = updateListItemInput;

    const queryBuilder = this.listItemRepository
      .createQueryBuilder()
      .update()
      .set(rest)
      .where('id = :id', { id });

    if (listId) queryBuilder.set({ list: { id: listId } });
    if (itemId) queryBuilder.set({ item: { id: itemId } });

    await queryBuilder.execute();
    return this.findOne(id);

    // Traditional update
    // const { listId, itemId, ...rest } = updateListItemInput;
    // const listItem = await this.listItemRepository.preload({
    //   ...rest,
    //   list: { id: listId },
    //   item: { id: itemId },
    // });
    // if (!listItem)
    //   throw new NotFoundException(`List item with id ${id} not found`);
    // return this.listItemRepository.save(listItem);
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }
}
