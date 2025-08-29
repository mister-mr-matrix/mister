<script lang="ts">
	import type { PageData, ActionData } from './$types.js';

	import { formSchema } from './schema';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';

	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	let { data, form: action }: { data: PageData; form: ActionData } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(formSchema),
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

	const { form: formData, enhance } = form;

	const expDateOpts = data.expDateOpts;
	function getLabelByValue(v: string): string {
		return expDateOpts.find(({ value }) => v === value)?.label ?? 'N/A';
	}

	const [{ value: defaultExpiry }] = expDateOpts;
	$formData.expiresInUnit = defaultExpiry;
</script>

<div class="flex min-h-screen items-center justify-center p-2">
	<form method="POST" use:enhance>
		<Card.Root class="w-full max-w-sm">
			<Card.Header>
				<Card.Title><b>Mister</b> - <b>M</b>atrix <b>R</b>egistration</Card.Title>
				<Card.Description>
					Issue a new token by picking the expiration date and optionally writing a description.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<Form.Field {form} name="expiresInUnit">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Expiration date</Form.Label>
							<Select.Root type="single" bind:value={$formData.expiresInUnit} name={props.name}>
								<Select.Trigger {...props} class="w-full">
									{$formData.expiresInUnit
										? getLabelByValue($formData.expiresInUnit)
										: 'Select an expiration date'}
								</Select.Trigger>
								<Select.Content>
									{#each expDateOpts as { label, value }}
										<Select.Item {label} {value} />
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.Description>Choose when the token should expire.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="description">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Description</Form.Label>
							<Input {...props} bind:value={$formData.description} />
						{/snippet}
					</Form.Control>
					<Form.Description>
						Enter a descriptive text that will be visible only on the admin panel.
					</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
			</Card.Content>
			<Card.Footer class="flex-col gap-2">
				<Form.Button class="w-full">Proceed</Form.Button>
				<a href="/admin">
					<Button variant="link" class="w-full">Go to admin panel</Button>
				</a>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
