<script>
	//import NetworkGraphCanvas from './NetworkGraphCanvas.svelte';
	//import GraphSvelteSVG from './NetworkGraphSvelteSVG.svelte';
	import NetworkGraphD3SVG from './force/NetworkGraphD3SVG.svelte';
	import NetworkGraph from '$lib/components/NetworkGraph.svelte';
	import data from './force/data2.js';
</script>

<h1 class="mb-2 text-3xl font-bold tracking-tight md:text-5xl py-2">紅樓夢</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<div class="chart">
	<NetworkGraph graph={data} />
</div>

<style>
	.chart {
		width: max-content;
		height: max-content;
		margin: 0 auto;
	}
</style>
