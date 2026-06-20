import {
	BaggageClaimIcon,
	BookOpenIcon,
	BriefcaseBusinessIcon,
	CarFrontIcon,
	DumbbellIcon,
	GiftIcon,
	HeartPulseIcon,
	HouseIcon,
	MailboxIcon,
	PawPrintIcon,
	PiggyBankIcon,
	ReceiptTextIcon,
	ShoppingCartIcon,
	TicketIcon,
	ToolCaseIcon,
	UtensilsIcon,
} from 'lucide-react';
import { Button } from '@/components/button';
import { Field, FieldLabel } from '@/components/ui/field';

export function IconSelector() {
	return (
		<Field>
			<FieldLabel>Ícone</FieldLabel>
			<div className="grid grid-cols-8 gap-2">
				<Button type="button" variant="outline" size="icon">
					<BriefcaseBusinessIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<CarFrontIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<HeartPulseIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<PiggyBankIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<ShoppingCartIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<TicketIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<ToolCaseIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<UtensilsIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<PawPrintIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<HouseIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<GiftIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<DumbbellIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<BookOpenIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<BaggageClaimIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<MailboxIcon />
				</Button>
				<Button type="button" variant="outline" size="icon">
					<ReceiptTextIcon />
				</Button>
			</div>
		</Field>
	);
}
