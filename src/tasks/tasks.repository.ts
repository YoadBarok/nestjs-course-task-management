import { InjectRepository } from "@nestjs/typeorm";
import { Task } from "./task.entity";
import { Brackets, DeleteResult, Repository } from "typeorm";
import { Injectable } from "@nestjs/common/decorators/core";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TaskStatus } from "./task-status.enum";
import { NotFoundException } from "@nestjs/common";
import { GetTasksFilterDto } from "./dto/get-tasks-filter.dto";

@Injectable()
export class TaskRepository {
    constructor(
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
    ) { }


    async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
        const { status, search } = filterDto;
        const query = this.taskRepository.createQueryBuilder('task');
        if (status) {
            query.andWhere('status = :status', { status });
        }
        if (search) {
            query.andWhere(
                new Brackets((qb) => {
                    qb.where('title ILIKE :search OR description ILIKE :search', {
                        search: `%${search}%`,
                    });
                }),
            );
        }
        const tasks = await query.getMany();
        return tasks;
    }

    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        const { title, description } = createTaskDto;
        const task = this.taskRepository.create({
            title,
            description,
            status: TaskStatus.OPEN
        });

        await this.taskRepository.save(task);
        return task;
    }

    async findTaskById(id: string): Promise<Task> {
        const found = await this.taskRepository.findOne({
            where: { id }
        });
        if (!found) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }
        return found;
    }

    async deleteTask(id: string): Promise<DeleteResult> {
        return this.taskRepository.delete(id);
    }

    async save(task: Task) {
        return this.taskRepository.save(task);
    }

}