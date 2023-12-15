<script>
	//import NetworkGraphCanvas from './NetworkGraphCanvas.svelte';
	//import GraphSvelteSVG from './NetworkGraphSvelteSVG.svelte';
	import NetworkGraphD3SVG from './force/NetworkGraphD3SVG.svelte';
	import NetworkGraph from '$lib/components/NetworkGraph.svelte';
	import data from './force/data2.js';
</script>

<h1 class="mb-2 text-3xl font-bold tracking-tight md:text-5xl py-2">紅樓夢</h1>
<p>花谢花飞飞满天，红消香断有谁怜?</p>

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
