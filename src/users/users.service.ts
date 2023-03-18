import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/inputs/create-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/inputs/update-user.input';

@Injectable()
export class UsersService {
  private logger: Logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10),
      });
      return await this.usersRepository.save(newUser);
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  async findAll(roles: ValidRoles[]): Promise<User[]> {
    if (roles.length === 0)
      return await this.usersRepository.find({
        relations: {
          lastUpdateBy: true,
        },
      });
    return this.usersRepository
      .createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch (error) {
      this.handleDatabaseErrors({
        code: 'userNotFound',
        detail: `${id} not found`,
      });
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ email });
    } catch (error) {
      this.handleDatabaseErrors({
        code: 'emailNotFound',
        detail: `${email} not found`,
      });
    }
  }

  async update(
    updateUserInput: UpdateUserInput,
    updateBy: User,
  ): Promise<User> {
    try {
      const user = await this.usersRepository.preload({
        ...updateUserInput,
      });
      user.lastUpdateBy = updateBy;
      return await this.usersRepository.save(user);
    } catch (error) {
      this.handleDatabaseErrors(error);
    }
  }

  async block(id: string, userUpdating: User): Promise<User> {
    const userToBlock = await this.findOneById(id);
    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = userUpdating;
    return await this.usersRepository.save(userToBlock);
  }

  private handleDatabaseErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key ', ''));
    }

    if (error.code === 'emailNotFound') {
      throw new BadRequestException(error.detail.replace('Key ', ''));
    }

    this.logger.error(error);
    throw new InternalServerErrorException(`Please check server logs`);
  }
}
