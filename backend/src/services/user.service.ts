import type { UserModel } from '../models/user.model.ts';
import type { UserRepository } from '../repositories/user.repository.ts';

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async findUser(id: string): Promise<UserModel> {
		return this.userRepository.findById(id);
	}
}
