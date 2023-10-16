import * as d3 from 'd3';

export function networkGraph(el, { data }) {
	const strokeColor = 'black';
	const highlightStroke = 'pink';
	const imgLength = 24;
	const imgWidth = 24;
	const radius = 13;

	let width = 1000;
	let height = 800;
	let linkOpacity = 0.35;
	let labelOpacity = 0.35;
	// const padding = { top: 20, right: 40, bottom: 40, left: 25 };

	const links = data.links.map((d) => Object.create(d));
	const nodes = data.nodes
		.map((d) => Object.create(d))
		.sort((a, b) => d3.ascending(a.value, b.value));
	const colourScale = d3.scaleOrdinal(d3.schemeRdPu[3]);

	const simulation = d3
		.forceSimulation(nodes)
		.force(
			'link',
			d3
				.forceLink(links)
				.id((d) => d.id)
				.strength(0.125)
		)
		.force('charge', d3.forceManyBody())
		.force('center', d3.forceCenter(width / 2, height / 2));

	const svg = d3
		.select(el)
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('viewBox', [0, 0, width, height]);

	const g = svg.append('g');

	// Link reference
	let linkedByIndex = {};
	data.links.forEach((d) => {
		linkedByIndex[`${d.source},${d.target}`] = true;
	});

	//  Nodes map
	let nodesById = {};
	data.nodes.forEach((d) => {
		nodesById[d.id] = { ...d };
	});

	const isConnectedAsSource = (a, b) => linkedByIndex[`${a},${b}`];
	const isConnectedAsTarget = (a, b) => linkedByIndex[`${b},${a}`];
	const isConnected = (a, b) => isConnectedAsSource(a, b) || isConnectedAsTarget(a, b) || a === b;

	// mouse events

	const nodeMouseOver = (d, links) => {
		let isConnectedValue;
		node.transition(500).style('opacity', (o) => {
			isConnectedValue = isConnected(o.id, d.id);
			if (isConnectedValue) {
				return 1.0;
			}
			return 0.1;
		});

		link
			.transition(500)
			.style('stroke-opacity', (o) => {
				// console.log(o, d);
				return o.source === d || o.target === d ? 1 : 0.1;
			})
			.transition(500)
			.attr('marker-end', (o) => (o.source === d || o.target === d ? 'url(#arrowhead)' : 'url()'));

		textElems
			.transition(500)
			.style('font-size', (o) => {
				isConnectedValue = isConnected(o.id, d.id);
				// console.log(isConnectedValue);
				if (isConnectedValue) {
					return '12px';
				}
				return '0px';
			})
			.style('opacity', (o) => {
				isConnectedValue = isConnected(o.id, d.id);
				// console.log(isConnectedValue);
				if (isConnectedValue) {
					return 1.0;
				}
				return 0;
			});
	};

	const nodeMouseOut = (d) => {
		node.transition(500).style('opacity', 1);
		// textElems.transition(500).style('font-size', '0px');
		textElems.transition(500).style('font-size', '10px').style('opacity', 1);

		link.transition(500).style('stroke-opacity', (o) => {
			// console.log(o.value);
		});
	};

	// Linking branches
	const link = g
		.append('g')
		.attr('stroke', '#222')
		.selectAll('line')
		.data(links)
		.join('line')
		.attr('stroke-opacity', linkOpacity)
		.attr('stroke-width', (d) => Math.sqrt(d.value));

	// Nodes
	const node = g
		.append('g')
		.selectAll('.node')
		.data(nodes)
		.join('g')
		.attr('class', 'node')
		.call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

	// circles
	node
		.append('circle')
		.attr('stroke', '#000')
		.attr('stroke-width', '1px')
		.attr('r', (d) => Math.min(Math.max(d.value / 2, 14), 60))
		.attr('fill', (d) => {
			return colourScale(d.categories);
		});

	// Clip-path for the images
	node
		.append('clipPath')
		.attr('id', (d) => d.id)
		.append('circle')
		.attr('r', (d) => Math.min(Math.max(d.value / 2, 14), 60));
	// add Images
	node
		.append('image')
		.attr('xlink:href', (d) => {
			const matchingRefImg = data.nodes.find((i) => i.id === d.id).image;
			return matchingRefImg ? matchingRefImg : '';
		})
		.attr('clip-path', (d) => `url(#${d.id})`)
		.attr('x', '-37px')
		.attr('y', '-27px')
		.attr('width', '74px')
		.attr('height', '54px')
		.on('mouseover', (ev, d) => {
			nodeMouseOver(d, data.links);
		})
		.on('mouseout', nodeMouseOut);
	// .on("mousemove", () => )

	// Text Title
	// const textElems = g
	// 	.append('g')
	// 	.selectAll('text')

	const textElems = node
		.append('text')
		.data(nodes)
		.join('text')
		.text((d) => d.label)
		.attr('font-size', 10)
		.attr('font-weight', 400)
		.attr('transform', 'translate(26, 0)')
		.style('fill', 'black')
		.style('opacity', 1)
		// .style("opacity", labelOpacity)
		.style('text-anchor', 'left')
		//.style("pointer-events", "none")
		.style('cursor', 'pointer')
		.text((d) => (d.title ? d.title : d.label))
		.call(d3.drag(simulation))
		.on('mouseover', (ev, d) => {
			nodeMouseOver(d, data.links);
		})
		.on('mouseout', nodeMouseOut);

	simulation.on('tick', simulationUpdate);

	function simulationUpdate() {
		link
			.attr('x1', (d) => d.source.x)
			.attr('y1', (d) => d.source.y)
			.attr('x2', (d) => d.target.x)
			.attr('y2', (d) => d.target.y);

		node.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

		// textElems.attr('x', (d) => d.x + 34).attr('y', (d) => d.y);
	}

	const zoomed = (currentEvent) => {
		g.attr('transform', currentEvent.transform);
		simulationUpdate();
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

	window.addEventListener('resize', resize);

	return {
		destroy() {
			window.removeEventListener('resize', resize);
		}
	};
}
