<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Copy } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let { label, value }: { label: string; value: string } = $props();

	function copyToClipboard() {
		navigator.clipboard
			.writeText(value)
			.then(() => {
				toast.success(`${label} copied to clipboard!`);
			})
			.catch((err) => {
				toast.error(`Failed to copy ${label}`);
				console.error('Clipboard copy failed: ', err);
			});
	}
</script>

<Button variant="outline" onclick={() => copyToClipboard()}>
	<Copy />
</Button>
