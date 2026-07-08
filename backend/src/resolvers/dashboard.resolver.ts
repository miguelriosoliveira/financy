import { Authorized, Query, Resolver } from 'type-graphql';
import { UserInfo } from '../auth/user-info.decorator.ts';
import { DashboardSummary } from '../dtos/output/dashboard-summary.output.ts';
import type { DashboardService } from '../services/dashboard.service.ts';
import type { JwtPayload } from '../services/jwt.service.ts';

@Authorized()
@Resolver(() => DashboardSummary)
export class DashboardResolver {
	constructor(private readonly dashboardService: DashboardService) {}

	@Query(() => DashboardSummary)
	async getDashboardSummary(@UserInfo() user: JwtPayload): Promise<DashboardSummary> {
		return this.dashboardService.getSummary(user.id);
	}
}
