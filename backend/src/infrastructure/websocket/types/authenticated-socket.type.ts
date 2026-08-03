import { Socket } from 'socket.io';

import { User } from '../../../domain/entities/user.entity.js';

export interface AuthenticatedSocket extends Socket {
  data: Socket['data'] & {
    user: User;
  };
}
