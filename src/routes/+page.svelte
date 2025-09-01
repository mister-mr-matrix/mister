<script lang="ts">
	import type { PageData, ActionData } from './$types.js';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/state';

	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Eye, EyeOff, Loader } from '@lucide/svelte';

	import { formSchema } from './schema';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import CopyButton from '$lib/components/custom/copy-btn/copy-btn.svelte';

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
	{#if action?.credetials}
		<Card.Root class="w-full max-w-sm">
			<Card.Header>
				<Card.Title><b>Mister</b> - <b>M</b>atrix <b>R</b>egistration</Card.Title>
				<Card.Description>
					Properly save your new credentials before leaving, otherwise they will be lost.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col gap-6">
					<div class="grid gap-2">
						<Label for="username">Username</Label>
						<div class="flex gap-1">
							<Input id="username" type="text" value={action.credetials.username} readonly />
							<CopyButton label="Username" value={action.credetials.username} />
						</div>
					</div>
					<div class="grid gap-2">
						<Label for="passphrase">Passphrase</Label>
						<div class="flex gap-1">
							<Input
								id="passphrase"
								type="password"
								value={action.credetials.passphrase}
								readonly
							/>
							<!-- TODO: What about noJS users? -->
							<CopyButton label="Passphrase" value={action.credetials.passphrase} />
						</div>
					</div>
				</div>
			</Card.Content>
			<Card.Footer class="flex-col gap-2">
				<a href="/" class="w-full">
					<Button class="w-full">Done</Button>
				</a>
				<a href="/admin">
					<Button variant="link" class="w-full">Go to admin panel</Button>
				</a>
			</Card.Footer>
		</Card.Root>
	{:else}
		<form method="POST" use:enhance>
			<Card.Root class="w-full max-w-sm">
				<Card.Header>
					<Card.Title><b>Mister</b> - <b>M</b>atrix <b>R</b>egistration</Card.Title>
					<Card.Description>
						Enter the token you received and click the button below to register your Matrix account.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<Form.Field {form} name="token">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Registration token</Form.Label>
								<Input {...props} bind:value={$formData.token} />
							{/snippet}
						</Form.Control>
						<Form.Description>
							Please ensure that you have entered the token correctly.
						</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
					{#if env.PUBLIC_MR_RANDOM_USERNAME !== 'true'}
						<Form.Field {form} name="username">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Username</Form.Label>
									<div class="flex gap-2">
										<Input
											{...props}
											bind:value={$formData.username}
											placeholder={data.generatedUsername}
										/>
										<Button
											type="button"
											onclick={() => {
												$formData.username = data.generatedUsername;
											}}
											data-sidebar="trigger"
											variant="outline"
											size="icon"
										>
											<Loader />
											<span class="sr-only">Use the generated username</span>
										</Button>
									</div>
								{/snippet}
							</Form.Control>
							<Form.Description>The username for your Matrix account.</Form.Description>
							<Form.FieldErrors />
						</Form.Field>
					{/if}
					{#if env.PUBLIC_MR_RANDOM_PASSWORD !== 'true'}
						<Form.Field {form} name="password">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Password</Form.Label>
									<div class="flex gap-2">
										<Input
											type={inputVisible ? 'text' : 'password'}
											{...props}
											bind:value={$formData.password}
											placeholder={data.generatedPassword}
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
											<span class="sr-only">Show/Hide password</span>
										</Button>
										<Button
											type="button"
											onclick={() => {
												$formData.password = data.generatedPassword;
											}}
											data-sidebar="trigger"
											variant="outline"
											size="icon"
										>
											<Loader />
											<span class="sr-only">Use the generated password</span>
										</Button>
									</div>
								{/snippet}
							</Form.Control>
							<Form.Description>The password for your Matrix account.</Form.Description>
							<Form.FieldErrors />
						</Form.Field>
					{/if}
				</Card.Content>
				<Card.Footer class="flex-col gap-2">
					<Form.Button class="w-full">Proceed</Form.Button>
					<a href="/admin">
						<Button variant="link" class="w-full">Go to admin panel</Button>
					</a>
				</Card.Footer>
			</Card.Root>
		</form>
	{/if}
</div>
