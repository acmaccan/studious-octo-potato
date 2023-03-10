import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput } from './dto/input/create-item.input';
import { UpdateItemInput } from './dto/input/update-item.input';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput): Promise<Item> {
    const newItem = this.itemsRepository.create(createItemInput);
    return await this.itemsRepository.save(newItem);
  }

  async findAll(): Promise<Item[]> {
    return await this.itemsRepository.find();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Item with id ${id} not found`);
    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    const findedItem = await this.itemsRepository.preload(updateItemInput);
    if (!findedItem)
      throw new NotFoundException(`Item with id ${id} not found`);
    return await this.itemsRepository.save(findedItem);
  }

  async remove(id: string): Promise<Item> {
    // TODO: soft delete and referencial integrity
    const item = await this.findOne(id);
    await this.itemsRepository.remove(item);
    return { ...item, id };
  }
}
