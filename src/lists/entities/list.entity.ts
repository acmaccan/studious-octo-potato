import { ObjectType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { ListItem } from '../../list-item/entities/list-item.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'lists' })
@ObjectType()
export class List {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  @IsNotEmpty()
  name: string;

  // Lists has a relation ManyToOne with User
  @ManyToOne(() => User, (user) => user.lists, { nullable: false, lazy: true })
  @Index('userId-list-index')
  @Field(() => User)
  user: User;

  // One List with Many ListItems
  @OneToMany(() => ListItem, (listItem) => listItem.list, { lazy: true })
  // @Field(() => [ListItem])
  listItem: ListItem[];
}
