<!--
	Mycel Ambient Map
	The primary UI. A living visualization of the user's trust network.
	Renders on Canvas for performance.
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { peerList } from '$lib/stores/app';
	import type { Peer } from '$lib/types';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animationFrame: number;
	let width = 0;
	let height = 0;

	/** Node positions, computed from trust scores */
	interface NodePosition {
		peer: Peer;
		x: number;
		y: number;
		radius: number;
		targetX: number;
		targetY: number;
	}

	let nodes: NodePosition[] = [];

	const COLORS = {
		available: '#5a9e6a',
		limited: '#8a8e4a',
		unavailable: '#4a4a4a',
		edge: 'rgba(106, 173, 122, 0.15)',
		edgeStrong: 'rgba(106, 173, 122, 0.4)',
		text: '#c8d6c0',
		textDim: '#6b7f60',
		offer: '#6aad7a',
		need: '#c47a3a',
		bg: '#0a0f0a'
	};

	function capacityColor(capacity: string | undefined): string {
		if (capacity === 'available') return COLORS.available;
		if (capacity === 'limited') return COLORS.limited;
		return COLORS.unavailable;
	}

	/** Compute node positions in a radial layout centered on screen */
	function layoutNodes(peers: Peer[]) {
		const cx = width / 2;
		const cy = height / 2;
		const maxRadius = Math.min(width, height) * 0.38;

		nodes = peers.map((peer, i) => {
			// Higher trust = closer to center
			const maxScore = Math.max(...peers.map(p => p.trustScore), 1);
			const normalizedScore = peer.trustScore / maxScore;
			const distance = maxRadius * (1 - normalizedScore * 0.7);

			// Spread evenly around the circle
			const angle = (i / Math.max(peers.length, 1)) * Math.PI * 2 - Math.PI / 2;

			const targetX = cx + Math.cos(angle) * distance;
			const targetY = cy + Math.sin(angle) * distance;

			// Node size based on trust score (min 6, max 24)
			const radius = 6 + normalizedScore * 18;

			const existing = nodes.find(n => n.peer.pubkey === peer.pubkey);

			return {
				peer,
				x: existing?.x ?? targetX,
				y: existing?.y ?? targetY,
				radius,
				targetX,
				targetY
			};
		});
	}

	/** Smooth animation toward target positions */
	function animate() {
		if (!ctx) return;

		ctx.clearRect(0, 0, width, height);

		// Draw edges between nodes
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				const a = nodes[i];
				const b = nodes[j];
				// Edge opacity based on combined trust scores
				const strength = Math.min((a.peer.trustScore + b.peer.trustScore) / 20, 1);
				if (strength < 0.1) continue;

				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.strokeStyle = strength > 0.5 ? COLORS.edgeStrong : COLORS.edge;
				ctx.lineWidth = strength * 2;
				ctx.stroke();
			}
		}

		// Draw nodes
		for (const node of nodes) {
			// Ease toward target
			node.x += (node.targetX - node.x) * 0.08;
			node.y += (node.targetY - node.y) * 0.08;

			const presence = node.peer.presence;
			const color = capacityColor(presence?.capacity);

			// Outer glow for available nodes
			if (presence?.capacity === 'available') {
				ctx.beginPath();
				ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
				ctx.fillStyle = color.replace(')', ', 0.15)').replace('rgb', 'rgba');
				ctx.fill();
			}

			// Main node circle
			ctx.beginPath();
			ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
			ctx.fillStyle = color;
			ctx.fill();

			// Offer/need indicators
			if (presence?.offers && presence.offers.length > 0) {
				ctx.beginPath();
				ctx.arc(node.x + node.radius * 0.7, node.y - node.radius * 0.7, 3, 0, Math.PI * 2);
				ctx.fillStyle = COLORS.offer;
				ctx.fill();
			}
			if (presence?.needs && presence.needs.length > 0) {
				ctx.beginPath();
				ctx.arc(node.x - node.radius * 0.7, node.y - node.radius * 0.7, 3, 0, Math.PI * 2);
				ctx.fillStyle = COLORS.need;
				ctx.fill();
			}

			// Name label
			const name = node.peer.name || node.peer.pubkey.slice(0, 8) + '…';
			ctx.font = `${Math.max(10, node.radius * 0.7)}px system-ui`;
			ctx.fillStyle = COLORS.text;
			ctx.textAlign = 'center';
			ctx.fillText(name, node.x, node.y + node.radius + 14);
		}

		// Center label
		ctx.font = '11px system-ui';
		ctx.fillStyle = COLORS.textDim;
		ctx.textAlign = 'center';
		ctx.fillText('you', width / 2, height / 2 + 4);

		animationFrame = requestAnimationFrame(animate);
	}

	function handleResize() {
		width = canvas.parentElement?.clientWidth || window.innerWidth;
		height = canvas.parentElement?.clientHeight || window.innerHeight;
		canvas.width = width * devicePixelRatio;
		canvas.height = height * devicePixelRatio;
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
		ctx.scale(devicePixelRatio, devicePixelRatio);
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		handleResize();
		window.addEventListener('resize', handleResize);
		animate();
	});

	onDestroy(() => {
		cancelAnimationFrame(animationFrame);
		window.removeEventListener('resize', handleResize);
	});

	// React to peer changes
	$: if ($peerList) {
		layoutNodes($peerList);
	}
</script>

<div class="ambient-map">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.ambient-map {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
	}
	canvas {
		display: block;
	}
</style>
