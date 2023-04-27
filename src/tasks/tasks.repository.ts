import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Brackets, DeleteResult, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common/decorators/core';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class TaskRepository {
  private logger: Logger = new Logger('TaskRepository');
  constructor(
    @InjectRepository(Task)
    private db: Repository<Task>,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.db.createQueryBuilder('task');
    query.andWhere({ user });
    if (status) {
      query.andWhere('status = :status', { status });
    }
    if (search) {
      query.andWhere(
        new Brackets((queryBrackets) => {
          queryBrackets.where(
            'title ILIKE :search OR description ILIKE :search',
            {
              search: `%${search}%`,
            },
          );
        }),
      );
    }
    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user ${
          user.username
        }. Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.db.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.db.save(task);
    return task;
  }

  async findTaskById(id: string, user: User): Promise<Task> {
    const query = this.db.createQueryBuilder('task');
    query.where({ id, user });
    return query.getOne();
  }

  async deleteTask(id: string, user: User): Promise<DeleteResult> {
    return this.db.delete({ id, user });
  }

  async save(task: Task) {
    return this.db.save(task);
  }
}
