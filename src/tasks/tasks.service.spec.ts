import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './tasks.repository';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  findTaskById: jest.fn(),
});

const mockUser = {
  username: 'Yoad',
  id: 'someId',
  password: 'password',
  tasks: [],
  created_at: new Date(),
  updated_at: new Date(),
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTasksRepository },
      ],
    }).compile();
    tasksService = module.get(TasksService);
    tasksRepository = module.get(TaskRepository);
  });

  describe('getTasks', () => {
    it('calls TasksRepository.getTasks and return the result', async () => {
      tasksRepository.getTasks.mockResolvedValue('someValue');
      const result = await tasksService.getTasks(null, mockUser);
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls TasksRepository.findTaskById and gets the task with id abc', async () => {
      const mockedTask = {
        id: 'abc',
        title: 'someTitle',
        description: 'someDescription',
        status: TaskStatus.OPEN,
      };
      tasksRepository.findTaskById.mockResolvedValue(mockedTask);
      const result = await tasksService.getTaskById('abc', mockUser);
      expect(result).toEqual(mockedTask);
    });
    it('calls TasksRepository.findTaskById and handles an error', async () => {
      tasksRepository.findTaskById.mockResolvedValue(null);
      expect(tasksService.getTaskById('abc', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
