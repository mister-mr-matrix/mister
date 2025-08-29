import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import type { Token } from '$lib/types/token';
import { renderSnippet } from '$lib/components/ui/data-table/index.js';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableActions from './data-table-actions.svelte';
import type { FormSubmitFunction } from '$lib/types/form';

export function createColumns(
	frontendUrl: string,
	submitRemoveToken: FormSubmitFunction
): ColumnDef<Token>[] {
	return [
		{
			accessorKey: 'token',
			header: 'Token'
		},
		{
			accessorKey: 'description',
			header: 'Description'
		},
		{
			accessorKey: 'createdAt',
			header: 'Creation date',
			cell: ({ row }) => {
				const createdAt = new Date(row.original.createdAt);
				const formattedDate = new Intl.DateTimeFormat('en-GB', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				}).format(createdAt);

				const createdAtCellSnippet = createRawSnippet<[string]>((getCreatedAt) => {
					const date = getCreatedAt();
					return {
						render: () => `${date}`
					};
				});

				return renderSnippet(createdAtCellSnippet, formattedDate);
			}
		},
		{
			accessorKey: 'expiresAt',
			header: 'Expiration date',
			cell: ({ row }) => {
				const expiresAt = new Date(row.original.expiresAt);
				const formattedDate = new Intl.DateTimeFormat('en-GB', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				}).format(expiresAt);

				const expiresAtCellSnippet = createRawSnippet<[string]>((getExpiresAt) => {
					const date = getExpiresAt();
					return {
						render: () => `${date}`
					};
				});

				return renderSnippet(expiresAtCellSnippet, formattedDate);
			}
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				return renderComponent(DataTableActions, {
					token: row.original.token,
					frontendUrl,
					submitRemoveToken
				});
			}
		}
		// {
		// 	accessorKey: 'amount',
		// 	header: () => {
		// 		const amountHeaderSnippet = createRawSnippet(() => ({
		// 			render: () => `<div class="text-right">Amount</div>`
		// 		}));
		// 		return renderSnippet(amountHeaderSnippet, '');
		// 	},
		// 	cell: ({ row }) => {
		// 		const formatter = new Intl.NumberFormat('en-US', {
		// 			style: 'currency',
		// 			currency: 'USD'
		// 		});

		// 		const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
		// 			const amount = getAmount();
		// 			return {
		// 				render: () => `<div class="text-right font-medium">${amount}</div>`
		// 			};
		// 		});

		// 		return renderSnippet(amountCellSnippet, formatter.format(parseFloat(row.getValue('amount'))));
		// 	}
		// }
	];
}
