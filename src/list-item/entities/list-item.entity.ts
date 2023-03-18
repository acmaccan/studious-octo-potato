import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Item } from '../../items/entities/item.entity';
import { List } from '../../lists/entities/list.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { IsBoolean, IsUUID, Min } from 'class-validator';

@Entity('listItems')
@Unique('listItem-item', ['list', 'item'])
@ObjectType()
export class ListItem {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Column({ type: 'numeric' })
  @Field(() => Number)
  @Min(0)
  quantity: number;

  @Column({ type: 'boolean' })
  @Field(() => Boolean)
  @IsBoolean()
  completed: boolean;

  // Many listItems in One List
  @ManyToOne(() => List, (list) => list.listItem, { lazy: true })
  @Field(() => List)
  list: List;

  // Many listItems for One Item
  @ManyToOne(() => Item, (item) => item.listItem, { lazy: true })
  @Field(() => Item)
  item: Item;
}
