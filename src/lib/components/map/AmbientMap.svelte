<!--
	Mycel Ambient Map
	The primary UI. A living visualization of the user's trust network.
	"You" sit at the center. Edges radiate outward to peers.
	Tap a peer node to see their details.
	Renders on Canvas for performance.
-->
<script lang="ts">
 import { t, tv } from '$lib/i18n';
	import { onMount, onDestroy } from 'svelte';
	import { peerList } from '$lib/stores/app';
 import type { Peer, PresenceData } from '$lib/types';

 interface Props {
  onpeerselect?: (peer: Peer) => void;
  onselfselect?: () => void;
  myPresence?: PresenceData | null;
 }

 let { onpeerselect, onselfselect, myPresence }: Props = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animationFrame: number;
	let width = 0;
	let height = 0;

 let tappedNode: NodePosition | null = null;
 let tapTime = 0;

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
		text: '#c8d6c0',
		textDim: '#6b7f60',
		offer: '#6aad7a',
		need: '#c47a3a',
		you: '#6aad7a',
		youGlow: 'rgba(106, 173, 122, 0.12)',
		youRing: 'rgba(106, 173, 122, 0.4)',
  matchOffer: 'rgba(106, 173, 122, ',   // green — they have what you need
  matchNeed: 'rgba(196, 122, 58, ',     // orange — you have what they need
  matchBoth: 'rgba(180, 160, 80, '      // gold — mutual match
	};

	function capacityColor(capacity: string | undefined): string {
		if (capacity === 'available') return COLORS.available;
		if (capacity === 'limited') return COLORS.limited;
		return COLORS.unavailable;
	}

	function layoutNodes(peers: Peer[]) {
		const cx = width / 2;
		const cy = height / 2;
		const maxRadius = Math.min(width, height) * 0.38;
		const maxScore = Math.max(...peers.map(p => p.trustScore), 1);

		nodes = peers.map((peer, i) => {
			const normalizedScore = peer.trustScore / maxScore;
			const distance = maxRadius * (1 - normalizedScore * 0.5);
			const angle = (i / Math.max(peers.length, 1)) * Math.PI * 2 - Math.PI / 2;

			const targetX = cx + Math.cos(angle) * distance;
			const targetY = cy + Math.sin(angle) * distance;
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

 /** Returns 1.0 for fresh presence, fading to 0.15 for fully stale */
 function freshnessAlpha(peer: Peer): number {
     if (!peer.presence) return 0.2;

     const age = Math.floor(Date.now() / 1000) - peer.presence.timestamp;
     const expiry = peer.presence.expiry || 3600;

     if (age <= expiry) return 1.0;

     // Fade over the next hour after expiry
     const fadeWindow = 3600;
     const fadePortion = Math.min((age - expiry) / fadeWindow, 1.0);
     return 1.0 - fadePortion * 0.85; // fades from 1.0 to 0.15
 }

 /** Check if there's an offer/need match between you and a peer */
 function hasMatch(peer: Peer): 'offer' | 'need' | 'both' | null {
     if (!myPresence || !peer.presence) return null;

     const theyOfferWeNeed = myPresence.needs.some(n => peer.presence!.offers.includes(n));
     const weOfferTheyNeed = myPresence.offers.some(o => peer.presence!.needs.includes(o));

     if (theyOfferWeNeed && weOfferTheyNeed) return 'both';
     if (theyOfferWeNeed) return 'offer';
     if (weOfferTheyNeed) return 'need';
     return null;
 }

	function handleCanvasClick(event: MouseEvent | TouchEvent) {
		if (!onpeerselect) return;

		const rect = canvas.getBoundingClientRect();
		let clientX: number, clientY: number;

		if ('touches' in event) {
			if (event.touches.length === 0) return;
			clientX = event.touches[0].clientX;
			clientY = event.touches[0].clientY;
		} else {
			clientX = event.clientX;
			clientY = event.clientY;
		}

		const x = clientX - rect.left;
		const y = clientY - rect.top;

  // Check if "you" node was tapped
  const cx = width / 2;
  const cy = height / 2;
  const dx = x - cx;
  const dy = y - cy;
  if (dx * dx + dy * dy <= 26 * 26) {
      tappedNode = { x: cx, y: cy, radius: 14 } as any;
      tapTime = performance.now();
      onselfselect?.();
      return;
  }

		// Check hit on nodes (reverse order so top-drawn nodes get priority)
  for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = x - node.x;
      const dy = y - node.y;
      const hitRadius = node.radius + 8;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
          tappedNode = node;
          tapTime = performance.now();
          onpeerselect?.(node.peer);
          return;
      }
  }
	}

	function animate() {
		if (!ctx) return;
		ctx.clearRect(0, 0, width, height);

		const cx = width / 2;
		const cy = height / 2;
		const maxScore = Math.max(...nodes.map(n => n.peer.trustScore), 1);

  // Draw edges from center (you) to each peer
  const now = performance.now();
  for (const node of nodes) {
      const strength = node.peer.trustScore / maxScore;
      if (strength < 0.05) continue;

      node.x += (node.targetX - node.x) * 0.08;
      node.y += (node.targetY - node.y) * 0.08;

      const freshness = freshnessAlpha(node.peer);
      const match = hasMatch(node.peer);

      if (match) {
          // Matched edge: colored with gentle pulse
          const pulse = 0.5 + 0.5 * Math.sin(now / 600);
          const baseAlpha = (0.2 + strength * 0.4 + pulse * 0.15) * freshness;
          const colorBase = match === 'offer' ? COLORS.matchOffer
              : match === 'need' ? COLORS.matchNeed
              : COLORS.matchBoth;

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(node.x, node.y);
          ctx.strokeStyle = colorBase + baseAlpha + ')';
          ctx.lineWidth = 1 + strength * 3;
          ctx.stroke();
      } else {
          // Normal edge
          const edgeAlpha = (0.08 + strength * 0.3) * freshness;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(node.x, node.y);
          ctx.strokeStyle = `rgba(106, 173, 122, ${edgeAlpha})`;
          ctx.lineWidth = 0.5 + strength * 2.5;
          ctx.stroke();
      }
  }

  // Draw peer nodes
  for (const node of nodes) {
      const presence = node.peer.presence;
      const color = capacityColor(presence?.capacity);
      const alpha = freshnessAlpha(node.peer);

      ctx.globalAlpha = alpha;

      // Glow for available nodes
      if (presence?.capacity === 'available') {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
          ctx.fillStyle = color.replace(')', ', 0.15)').replace('rgb', 'rgba');
          ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Offer indicator (top right)
      if (presence?.offers && presence.offers.length > 0) {
          ctx.beginPath();
          ctx.arc(node.x + node.radius * 0.7, node.y - node.radius * 0.7, 3, 0, Math.PI * 2);
          ctx.fillStyle = COLORS.offer;
          ctx.fill();
      }

      // Need indicator (top left)
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

      ctx.globalAlpha = 1.0;
  }

		// Draw "you" node at center
		const youRadius = 14;

		ctx.beginPath();
		ctx.arc(cx, cy, youRadius + 12, 0, Math.PI * 2);
		ctx.fillStyle = COLORS.youGlow;
		ctx.fill();

		ctx.beginPath();
		ctx.arc(cx, cy, youRadius + 2, 0, Math.PI * 2);
		ctx.strokeStyle = COLORS.youRing;
		ctx.lineWidth = 1;
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(cx, cy, youRadius, 0, Math.PI * 2);
		ctx.fillStyle = COLORS.you;
		ctx.fill();

		ctx.font = '10px system-ui';
		ctx.fillStyle = COLORS.textDim;
		ctx.textAlign = 'center';
		ctx.fillText($t('map.you'), cx, cy + youRadius + 14);

  // Tap pulse effect
  if (tappedNode) {
      const elapsed = performance.now() - tapTime;
      const duration = 400;
      if (elapsed < duration) {
          const progress = elapsed / duration;
          const pulseRadius = tappedNode.radius + 20 * progress;
          const alpha = 0.4 * (1 - progress);
          ctx.beginPath();
          ctx.arc(tappedNode.x, tappedNode.y, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(106, 173, 122, ${alpha})`;
          ctx.lineWidth = 2 * (1 - progress);
          ctx.stroke();
      } else {
          tappedNode = null;
      }
  }

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

 $effect(() => {
     if ($peerList) {
         layoutNodes($peerList);
     }
 });
</script>

<div class="ambient-map">
	<canvas
		bind:this={canvas}
		onclick={handleCanvasClick}
	></canvas>
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
		cursor: pointer;
	}
</style>
