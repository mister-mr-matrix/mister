import { createRawSnippet } from 'svelte';
import type { ColumnDef } from '@tanstack/table-core';
import { renderSnippet } from '$lib/components/ui/data-table/index.js';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import type { Token } from '$lib/types/token';
import type { FormSubmitFunction } from '$lib/types/form';
import { timeToISO8601 } from '$lib/time/utils';
import DataTableActions from './data-table-actions.svelte';

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
				const createdAtCellSnippet = createRawSnippet<[string]>((getCreatedAt) => {
					const date = getCreatedAt();
					return {
						render: () => `${date}`
					};
				});

				return renderSnippet(createdAtCellSnippet, timeToISO8601(row.original.createdAt));
			}
		},
		{
			accessorKey: 'expiresAt',
			header: 'Expiration date',
			cell: ({ row }) => {
				const expiresAtCellSnippet = createRawSnippet<[string]>((getExpiresAt) => {
					const date = getExpiresAt();
					return {
						render: () => `${date}`
					};
				});

				return renderSnippet(expiresAtCellSnippet, timeToISO8601(row.original.expiresAt));
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
	];
}
