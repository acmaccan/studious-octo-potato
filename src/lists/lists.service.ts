import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListInput, UpdateListInput } from './dto/inputs/';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from './entities/list.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
  ) {}

  async create(createListInput: CreateListInput, user: User): Promise<List> {
    const newList = this.listsRepository.create({ ...createListInput, user });
    return await this.listsRepository.save(newList);
  }

  async findAllByUser(
    user: User,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<List[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listsRepository
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
  }

  async findOneByUser(id: string, user: User): Promise<List> {
    const list = await this.listsRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!list) throw new NotFoundException(`List with id ${id} not found`);

    return list;
  }

  async updateByUser(
    id: string,
    updateListInput: UpdateListInput,
    user: User,
  ): Promise<List> {
    await this.findOneByUser(id, user);
    const findedList = await this.listsRepository.preload(updateListInput);
    if (!findedList)
      throw new NotFoundException(`List with id ${id} not found`);
    return await this.listsRepository.save(findedList);
  }

  async removeByUser(id: string, user: User): Promise<List> {
    const list = await this.findOneByUser(id, user);
    await this.listsRepository.remove(list);
    return { ...list, id };
  }

  async listsCountByUser(user: User): Promise<number> {
    return this.listsRepository.count({ where: { user: { id: user.id } } });
  }
}
