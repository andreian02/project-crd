<!-- <h2>d3 Force Directed Graph in Sveltejs - D3 created svg (allows zoom)</h2> -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { scaleLinear, scaleOrdinal } from 'd3-scale';
	import { zoom, zoomIdentity } from 'd3-zoom';
	import { schemeCategory10 } from 'd3-scale-chromatic';
	import { schemeRdPu } from 'd3-scale-chromatic';

	import { select, selectAll } from 'd3-selection';
	import { drag } from 'd3-drag';
	import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
	let d3 = {
		zoom,
		zoomIdentity,
		scaleLinear,
		scaleOrdinal,
		schemeCategory10,
		schemeRdPu,
		select,
		selectAll,
		drag,
		forceSimulation,
		forceLink,
		forceManyBody,
		forceCenter
	};
	export let graph;
	let width = 1100;
	let height = 1100;
	let linkOpacity = 0.35;
	let labelOpacity = 0.35;
	//const nodeRadius = 5;
	const padding = { top: 20, right: 40, bottom: 40, left: 25 };

	$: links = graph.links.map((d) => Object.create(d));
	$: nodes = graph.nodes.map((d) => Object.create(d));

	const colourScale = d3.scaleOrdinal(d3.schemeRdPu[3]);

	let simulation, svg;

	onMount(() => {
		simulation = d3
			.forceSimulation(nodes)
			.force(
				'link',
				d3.forceLink(links).id((d) => d.id)
			)

			.force('charge', d3.forceManyBody())
			.force('center', d3.forceCenter(width / 2, height / 2))
			.on('tick', simulationUpdate);

		svg = d3.select('.chart').append('svg').attr('width', width).attr('height', height);

		const g = svg.append('g'); // Need container when combininig drag and zoom
		// See example: https://observablehq.com/@d3/drag-zoom
		const link = g
			.append('g')
			.attr('stroke', '#999')
			//.attr("stroke-opacity", 0.6)
			.selectAll('line')
			.data(links)
			.join('line')

			.attr('class', 'link')
			.attr('stroke', '#777')

			.attr('stroke-opacity', linkOpacity)
			.attr('stroke-width', (d) => Math.sqrt(d.value));

		const node = g
			.append('g')
			.attr('stroke', '#fff')
			.attr('stroke-width', 1.5)
			.style('cursor', 'pointer')

			.attr('stroke-linecap', 'round')
			.attr('stroke-linejoin', 'round')

			.selectAll('circle')
			.data(nodes)
			.join('circle')
			.attr('r', (d) => Math.min(Math.max(d.value / 2, 8), 20))
			.attr('fill', (d) => colourScale(d.categories))
			.call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

		// node.append("title")
		//     .text(d => d.label);

		const textElems = g
			.append('g')
			.selectAll('text')
			.data(nodes)
			.join('text')
			.text((d) => d.label)
			.attr('font-size', 10)
			.attr('font-weight', 400)
			.style('fill', 'black')
			//.style("opacity", labelOpacity)
			.style('text-anchor', 'middle')
			//.style("pointer-events", "none")
			.style('cursor', 'pointer')
			.text((d) => (d.title ? d.title : d.label))
			.call(drag(simulation));

		//   node.append("title").text(function (d) {
		//     return "word: " + d.label;
		//   });

		const nodeClick = (event, elem) => {
			d3.select(event.currentTarget).on('click', function (d) {
				console.log('click!');
			});
		};

		const nodeMouseOver = (event, elem) => {
			// make current node in front
			d3.select(event.currentTarget).raise();

			// fade disconnected links
			d3.selectAll('.link')
				.filter((d) => elem.id != d.source.id && elem.id != d.target.id)
				.style('stroke-opacity', linkOpacity / 4);

			// highlight connected links
			const links = d3
				.selectAll('.link')
				.filter((d) => elem.id == d.source.id || elem.id == d.target.id)
				.style('stroke-opacity', 0.8);

			// get list of connected nodes
			const involved_nodes = links
				.data()
				.map((x) => [x.source.id, x.target.id])
				.flat();

			// fade disconnected nodes
			d3.selectAll('.node')
				.filter((d) => !involved_nodes.includes(d.id))
				.style('opacity', 0.25);

			// highlight connected labels
			d3.selectAll('.nodename')
				.filter((d) => involved_nodes.includes(d.id))
				.style('opacity', 0.25);

			// highlight this label
			const thisLabel = d3
				.selectAll('.nodename')
				.filter((d) => elem.index == d.index)
				.attr('font-weight', 500)
				.style('opacity', 1);

			// make background white
			thisLabel.clone(true);
			thisLabel.attr('class', 'nodename backwhite').attr('stroke', '#fff').attr('stroke-width', 3);
		};

		const nodeMouseOut = () => {
			// reset all
			d3.selectAll('.nodename.backwhite').remove();
			d3.selectAll('.node').style('opacity', 1);
			d3.selectAll('.link').style('stroke-opacity', linkOpacity);
			d3.selectAll('.nodename').attr('font-weight', 400).style('opacity', labelOpacity);
		};

		svg.call(
			d3
				.zoom()
				.extent([
					[0, 0],
					[width, height]
				])
				.scaleExtent([1 / 10, 8])
				.on('zoom', zoomed)
		);

		node.on('mouseover', nodeMouseOver).on('mouseout', nodeMouseOut);

		function simulationUpdate() {
			link
				.attr('x1', (d) => d.source.x)
				.attr('y1', (d) => d.source.y)
				.attr('x2', (d) => d.target.x)
				.attr('y2', (d) => d.target.y);
			node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

			textElems.attr('x', (d) => d.x + 23).attr('y', (d) => d.y);
		}

		function zoomed(currentEvent) {
			g.attr('transform', currentEvent.transform);
			simulationUpdate();
		}
	});

	function dragstarted(currentEvent) {
		if (!currentEvent.active) simulation.alphaTarget(0.3).restart();
		currentEvent.subject.fx = currentEvent.x;
		currentEvent.subject.fy = currentEvent.y;
	}
	function dragged(currentEvent) {
		currentEvent.subject.fx = currentEvent.x;
		currentEvent.subject.fy = currentEvent.y;
	}
	function dragended(currentEvent) {
		if (!currentEvent.active) simulation.alphaTarget(0);
		currentEvent.subject.fx = null;
		currentEvent.subject.fy = null;
	}
	function resize() {
		({ width, height } = svg.node().getBoundingClientRect());
	}
</script>

<svelte:window on:resize={resize} />

<div class="container" />
