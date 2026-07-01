import { ArrowDownCircleIcon, ArrowUpCircleIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { Tag, type TagColor } from '@/components/tag';
import {
	CategoryIcon,
	type CategoryType,
} from '@/pages/authenticated/categories/components/category-icon';

type TransactionRow = {
	id: string;
	description: string;
	date: string;
	categoryName: string;
	categoryIcon: CategoryType;
	categoryColor: TagColor;
	type: 'INCOME' | 'EXPENSE';
	amount: number;
};

const HARDCODED_TRANSACTIONS: TransactionRow[] = [
	{
		id: '1',
		description: 'Jantar no Restaurante',
		date: '30/11/25',
		categoryName: 'Alimentação',
		categoryIcon: 'food',
		categoryColor: 'blue',
		type: 'EXPENSE',
		amount: 89.5,
	},
	{
		id: '2',
		description: 'Posto de Gasolina',
		date: '28/11/25',
		categoryName: 'Transporte',
		categoryIcon: 'transport',
		categoryColor: 'purple',
		type: 'EXPENSE',
		amount: 120,
	},
	{
		id: '3',
		description: 'Mercado Semanal',
		date: '27/11/25',
		categoryName: 'Mercado',
		categoryIcon: 'groceries',
		categoryColor: 'orange',
		type: 'EXPENSE',
		amount: 245.8,
	},
	{
		id: '4',
		description: 'Retorno de Investimento',
		date: '26/11/25',
		categoryName: 'Investimento',
		categoryIcon: 'investment',
		categoryColor: 'green',
		type: 'INCOME',
		amount: 340.25,
	},
	{
		id: '5',
		description: 'Aluguel',
		date: '25/11/25',
		categoryName: 'Utilidades',
		categoryIcon: 'utilities',
		categoryColor: 'yellow',
		type: 'EXPENSE',
		amount: 1200,
	},
	{
		id: '6',
		description: 'Salário',
		date: '25/11/25',
		categoryName: 'Salário',
		categoryIcon: 'salary',
		categoryColor: 'green',
		type: 'INCOME',
		amount: 2500,
	},
	{
		id: '7',
		description: 'Cinema',
		date: '22/11/25',
		categoryName: 'Entretenimento',
		categoryIcon: 'entertainment',
		categoryColor: 'pink',
		type: 'EXPENSE',
		amount: 45,
	},
];

function formatCurrency(value: number, type: TransactionRow['type']) {
	const formatted = value.toLocaleString('pt-BR', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	return type === 'INCOME' ? `+ R$ ${formatted}` : `- R$ ${formatted}`;
}

export function TransactionTable() {
	return (
		<div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
			<table className="w-full text-left text-sm">
				<thead className="border-gray-300 border-b bg-gray-100 text-gray-600 uppercase">
					<tr>
						<th className="px-6 py-4 font-normal">Descrição</th>
						<th className="px-6 py-4 font-normal">Data</th>
						<th className="px-6 py-4 font-normal">Categoria</th>
						<th className="px-6 py-4 font-normal">Tipo</th>
						<th className="px-6 py-4 font-normal">Valor</th>
						<th className="px-6 py-4 font-normal">Ações</th>
					</tr>
				</thead>
				<tbody>
					{HARDCODED_TRANSACTIONS.map(transaction => (
						<tr key={transaction.id} className="border-gray-200 border-b last:border-b-0">
							<td className="px-6 py-4">
								<div className="flex items-center gap-3">
									<CategoryIcon
										category={transaction.categoryIcon}
										color={transaction.categoryColor}
									/>
									<span className="font-normal text-gray-800">{transaction.description}</span>
								</div>
							</td>
							<td className="px-6 py-4 font-light text-gray-600">{transaction.date}</td>
							<td className="px-6 py-4">
								<Tag color={transaction.categoryColor}>{transaction.categoryName}</Tag>
							</td>
							<td className="px-6 py-4">
								<div
									className={`flex items-center gap-2 ${transaction.type === 'INCOME' ? 'text-green-base' : 'text-red-base'}`}
								>
									{transaction.type === 'INCOME' ? (
										<ArrowUpCircleIcon className="size-4" />
									) : (
										<ArrowDownCircleIcon className="size-4" />
									)}
									<span>{transaction.type === 'INCOME' ? 'Entrada' : 'Saída'}</span>
								</div>
							</td>
							<td
								className={`px-6 py-4 font-normal ${transaction.type === 'INCOME' ? 'text-green-base' : 'text-gray-800'}`}
							>
								{formatCurrency(transaction.amount, transaction.type)}
							</td>
							<td className="px-6 py-4">
								<div className="flex items-center gap-2">
									<button
										type="button"
										className="rounded-md p-2 text-red-base hover:bg-red-light"
										aria-label="Excluir transação"
									>
										<Trash2Icon className="size-4" />
									</button>
									<button
										type="button"
										className="rounded-md p-2 text-gray-600 hover:bg-gray-200"
										aria-label="Editar transação"
									>
										<PencilIcon className="size-4" />
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex items-center justify-between border-gray-300 border-t px-6 py-4 text-gray-600 text-sm">
				<span className="font-light">1 a 10 | 27 resultados</span>
				<div className="flex items-center gap-2">
					<button
						type="button"
						className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-600"
						aria-label="Página anterior"
					>
						{'<'}
					</button>
					<button
						type="button"
						className="rounded-md bg-brand-base px-3 py-1.5 text-white"
						aria-label="Página 1"
					>
						1
					</button>
					<button
						type="button"
						className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-600"
						aria-label="Página 2"
					>
						2
					</button>
					<button
						type="button"
						className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-600"
						aria-label="Página 3"
					>
						3
					</button>
					<button
						type="button"
						className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-600"
						aria-label="Próxima página"
					>
						{'>'}
					</button>
				</div>
			</div>
		</div>
	);
}
