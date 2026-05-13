import { Module } from '@nestjs/common';
import { USER_SERVICE } from './interfaces/user-service.interface';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [
    UserRepository,
    UserService,
    { provide: USER_SERVICE, useClass: UserService },
  ],
  exports: [UserService, USER_SERVICE],
})
export class UserModule {}