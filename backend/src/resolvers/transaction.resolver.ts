import { createTransactionSchema, listTransactionsSchema } from '@financy/shared';
import { Arg, Authorized, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { UserInfo } from '../auth/user-info.decorator.ts';
import { CreateTransactionInput } from '../dtos/input/transaction.input.ts';
import { Validate } from '../middlewares/validate.middleware.ts';
import { TransactionModel } from '../models/transaction.model.ts';
import { TransactionPage } from '../models/transaction-page.model.ts';
import type { JwtPayload } from '../services/jwt.service.ts';
import type { TransactionService } from '../services/transaction.service.ts';

@Authorized()
@Resolver(() => TransactionModel)
export class TransactionResolver {
	constructor(private readonly transactionService: TransactionService) {}

	@Mutation(() => TransactionModel)
	@UseMiddleware(Validate(createTransactionSchema))
	async createTransaction(
		@Arg('data', () => CreateTransactionInput)
		data: CreateTransactionInput,
		@UserInfo() user: JwtPayload,
	): Promise<TransactionModel> {
		return this.transactionService.create(user.id, data);
	}

	@Query(() => TransactionPage)
	@UseMiddleware(Validate(listTransactionsSchema, 'flat'))
	async getTransactions(
		@Arg('page', () => Int, { defaultValue: 1 }) page: number,
		@Arg('pageSize', () => Int, { defaultValue: 10 }) pageSize: number,
		@UserInfo() user: JwtPayload,
	): Promise<TransactionPage> {
		return this.transactionService.findPage(user.id, { page, pageSize });
	}
}
