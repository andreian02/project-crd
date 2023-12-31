<!-- <h2>d3 Force Directed Graph in Sveltejs - D3 created svg (allows zoom)</h2> -->
<script>
	import { networkGraph } from './networkActions';

	export let graph;
</script>

<!-- <svelte:window on:resize={resize} /> -->

<!-- <h1>this is the network graph with images</h1> -->

<div class="container" use:networkGraph={{ data: graph }} />
