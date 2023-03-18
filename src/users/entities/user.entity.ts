import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from '../../items/entities/item.entity';
import { List } from '../../lists/entities/list.entity';

@Entity({ name: 'users' })
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  fullName: string;

  @Column({ unique: true })
  @Field(() => String)
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text', array: true, default: ['user'] })
  @Field(() => [String])
  roles: string[];

  @Column({ type: 'boolean', default: true })
  @Field(() => Boolean)
  isActive: boolean;

  // Many Users has a relationship with one lastUpdateBy
  @ManyToOne(() => User, (user) => user.lastUpdateBy, {
    nullable: true,
    lazy: true,
  })
  @JoinColumn({ name: 'lastUpdateBy' })
  @Field(() => User, { nullable: true })
  lastUpdateBy?: User;

  // One User has a relation with many Items
  // This field returns an array of Items
  // This generates a userId column in Items table
  @OneToMany(() => Item, (item) => item.user, { lazy: true })
  // @Field(() => [Item])
  items: Item[];

  // One User has a relation with many Lists
  // This field returns an array of Lists
  // This generates a userId column in Lists table
  @OneToMany(() => List, (list) => list.user, { lazy: true })
  // @Field(() => [List])
  lists: List[];
}
