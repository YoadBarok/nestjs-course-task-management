import { Injectable } from "@nestjs/common/decorators/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(User)
        private db: Repository<User>
    ) { }

    async getUserByUsername(username: string): Promise<User> {
        return this.db.findOne({
            where: { username }
        })
    }
    async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialsDto;
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = this.db.create({ username, password: hashedPassword });
        try {
            await this.db.save(user);
        } catch (error) {
            if (error.code === '23505') { // duplicate username
                throw new ConflictException("Username already exists.");
            } else {
                throw new InternalServerErrorException();
            }
        }
    }

}