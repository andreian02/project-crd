<script>

	//import NetworkGraphCanvas from './NetworkGraphCanvas.svelte';
	//import GraphSvelteSVG from './NetworkGraphSvelteSVG.svelte';
	import NetworkGraphD3SVG from './NetworkGraphD3SVG.svelte';
	import data from './data2.js';
</script>

<style>
	.chart {
		width: max-content;
		height: max-content;
		margin: 0 auto;
	}
</style>



<div class="chart">
	<NetworkGraphD3SVG graph={data} />
</div>