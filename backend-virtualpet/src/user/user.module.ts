import { Module } from '@nestjs/common';
import { AddressRepository } from './address.repository';
import { AddressService } from './address.service';
import { USER_SERVICE } from './interfaces/user-service.interface';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [
    UserRepository,
    UserService,
    AddressRepository,
    AddressService,
    { provide: USER_SERVICE, useClass: UserService },
  ],
  exports: [UserService, USER_SERVICE],
})
export class UserModule {}