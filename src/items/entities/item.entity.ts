import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsOptional, IsString } from 'class-validator';
import { ListItem } from '../../list-item/entities/list-item.entity';

@Entity({ name: 'items' })
@ObjectType()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  // Not necessary since relation between items and users
  // @Column()
  // @Field(() => Float)
  // quantity: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  quantityUnits?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  category: string;

  // Items has a relation ManyToOne with User
  // This field returns a user
  // This doesn't generate an items column in Users table
  // lazy allow us to bring the user data on an items request
  @ManyToOne(() => User, (user) => user.items, { nullable: false, lazy: true })
  @Index()
  @Field(() => User)
  user: User;

  // One Item for Many ListItems
  @OneToMany(() => ListItem, (listItem) => listItem.item, { lazy: true })
  @Field(() => [ListItem])
  listItem: ListItem[];
}
