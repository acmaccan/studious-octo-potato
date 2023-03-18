import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args/';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user });
    return await this.itemsRepository.save(newItem);
  }

  // select * from items
  // async findAll(): Promise<Item[]> {
  //   return await this.itemsRepository.find();
  // }

  // select * from items where userId = ''
  async findAllByUser(
    user: User,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<Item[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.itemsRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });

    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    return queryBuilder.getMany();

    // return await this.itemsRepository.find({
    //   take: limit,
    //   skip: offset,
    //   where: {
    //     user: {
    //       id: user.id,
    //     },
    //     name: Like(`%${search}%`), // where name LIKE '%search%'
    //   },
    // });
  }

  // select first from items where id = ''
  // async findOne(id: string): Promise<Item> {
  //   const item = await this.itemsRepository.findOne({ where: { id } });
  //   if (!item) throw new NotFoundException(`Item with id ${id} not found`);
  //   return item;
  // }

  // select first from items where id = '' && userId = ''
  async findOneByUser(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!item) throw new NotFoundException(`Item with id ${id} not found`);

    // Simple way to bring user data
    // Other way is to parse lazy: true on items entity
    // item.user = user;

    return item;
  }

  // update item from items where
  // async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
  //   const findedItem = await this.itemsRepository.preload(updateItemInput);
  //   if (!findedItem)
  //     throw new NotFoundException(`Item with id ${id} not found`);
  //   return await this.itemsRepository.save(findedItem);
  // }

  async updateByUser(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOneByUser(id, user);
    // with lazy
    const findedItem = await this.itemsRepository.preload(updateItemInput);
    //wothout lazy .preload({...updateItemInput, user});
    if (!findedItem)
      throw new NotFoundException(`Item with id ${id} not found`);
    return await this.itemsRepository.save(findedItem);
  }

  // async remove(id: string): Promise<Item> {
  //   // TODO: soft delete and referencial integrity
  //   const item = await this.findOne(id);
  //   await this.itemsRepository.remove(item);
  //   return { ...item, id };
  // }

  async removeByUser(id: string, user: User): Promise<Item> {
    // TODO: soft delete and referencial integrity
    const item = await this.findOneByUser(id, user);
    await this.itemsRepository.remove(item);
    return { ...item, id };
  }

  async itemsCountByUser(user: User): Promise<number> {
    return this.itemsRepository.count({ where: { user: { id: user.id } } });
  }
}
