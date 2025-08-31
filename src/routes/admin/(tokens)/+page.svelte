<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';

	import { formSchemaRemoveAllTokens, formSchemaRemoveToken } from './schema.js';
	import { createColumns } from './columns.js';
	import DataTable from './data-table.svelte';
	import { tokenStore } from '$lib/stores/token.svelte.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	let { data, form: action }: { data: PageData; form: ActionData } = $props();

	const formRemoveToken = superForm(data.formRemoveToken, {
		validators: zod4Client(formSchemaRemoveToken),
		onUpdated: ({ form: f }) => {
			const msg = action?.msg;
			if (msg === undefined) {
				return;
			}

			if (f.valid && page.status === 200) {
				toast.success(msg);
			} else {
				toast.error(msg);
			}
		}
	});

	const { enhance: enhanceRemoveToken, submit: submitRemoveToken } = formRemoveToken;

	const formRemoveAllTokens = superForm(data.formRemoveAllTokens, {
		validators: zod4Client(formSchemaRemoveAllTokens),
		onUpdated: ({ form: f }) => {
			const msg = action?.msg;
			if (msg === undefined) {
				return;
			}

			if (f.valid && page.status === 200) {
				toast.success(msg);
			} else {
				toast.error(msg);
			}
		}
	});

	const { enhance: enhanceRemoveAllTokens } = formRemoveAllTokens;

	const columns = createColumns(data.frontendUrl, submitRemoveToken);
</script>

<div class="flex min-h-screen items-center justify-center p-2">
	<Card.Root class="w-full max-w-7xl">
		<Card.Header>
			<Card.Title><b>Mister</b> - <b>M</b>atrix <b>R</b>egistration</Card.Title>
			<Card.Description>Admin panel with all of the currently active tokens.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="w-full">
				<DataTable data={data.tokens} {columns} />
			</div>
		</Card.Content>
		<Card.Footer class="flex-col gap-2">
			<a href="/admin/issue">
				<Button class="w-full">Issue a new token</Button>
			</a>
			<form method="POST" action="?/removeAllTokens" use:enhanceRemoveAllTokens>
				<Button type="submit" variant="destructive" class="w-full">Delete all tokens</Button>
			</form>
			<a href="/">
				<Button variant="link" class="w-full">Go to registration panel</Button>
			</a>
		</Card.Footer>
	</Card.Root>
</div>

<!-- Invisible form for programatically submiting removeToken action -->
<form method="POST" action="?/removeToken" use:enhanceRemoveToken>
	<input name="token" value={tokenStore.current} type="hidden" />
</form>
