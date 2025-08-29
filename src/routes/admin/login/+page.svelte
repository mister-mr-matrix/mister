<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import { page } from '$app/state';

	import { formSchema } from './schema';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';

	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Eye, EyeOff } from '@lucide/svelte';

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

	let inputVisible = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center p-2">
	<form method="POST" use:enhance>
		<Card.Root class="w-full max-w-sm">
			<Card.Header>
				<Card.Title><b>Mister</b> - <b>M</b>atrix <b>R</b>egistration</Card.Title>
				<Card.Description>Enter the admin token to login.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Form.Field {form} name="token">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Admin token</Form.Label>
							<div class="flex gap-2">
								<Input
									type={inputVisible ? 'text' : 'password'}
									{...props}
									bind:value={$formData.token}
								/>
								<Button
									type="button"
									onclick={() => {
										inputVisible = !inputVisible;
									}}
									data-sidebar="trigger"
									variant="outline"
									size="icon"
								>
									{#if inputVisible}
										<Eye />
									{:else}
										<EyeOff />
									{/if}
									<span class="sr-only">Show/Hide admin token</span>
								</Button>
							</div>
						{/snippet}
					</Form.Control>
					<Form.Description>
						Please ensure that you copy and paste the token correctly.
					</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
			</Card.Content>
			<Card.Footer class="flex-col gap-2">
				<Form.Button class="w-full">Proceed</Form.Button>
				<a href="/">
					<Button variant="link" class="w-full">Go to registration panel</Button>
				</a>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
