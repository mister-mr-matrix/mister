<script lang="ts">
	import type { FormSubmitFunction } from '$lib/types/form';
	import CopyButton from '$lib/components/custom/copy-btn/copy-btn.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Trash } from '@lucide/svelte';
	import { tokenStore } from '$lib/stores/token.svelte';
	import { tick } from 'svelte';

	let {
		token,
		frontendUrl,
		submitRemoveToken
	}: { token: string; frontendUrl: string; submitRemoveToken: FormSubmitFunction } = $props();
</script>

<CopyButton label="Token UUID" value={`${frontendUrl}${token}`} />

<!-- TODO: How to do this for noJS users? -->
<Button
	variant="destructive"
	onclick={() => {
		tokenStore.current = token;
		tick().then(() => submitRemoveToken());
	}}
>
	<Trash />
</Button>
