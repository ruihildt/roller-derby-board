<script lang="ts">
	import { Drawer, Timeline, TimelineItem } from 'flowbite-svelte';
	import { CloseOutline } from 'flowbite-svelte-icons';
	let hidden = true;
</script>

<button
	on:click={() => (hidden = false)}
	class="fixed right-4 top-4 rounded-lg bg-white px-4 py-2 text-sm text-gray-700 hover:bg-primary-200"
>
	Changelog
</button>

<Drawer
	bind:hidden
	placement="right"
	position="fixed"
	backdrop={false}
	width="w-96"
	class="shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)]"
>
	<Timeline>
		<div class="mb-2 flex items-center justify-between">
			<h5 class="pl-5 text-xl font-bold">Changelog</h5>
			<button on:click={() => (hidden = true)} class="rounded-lg p-2 hover:bg-primary-200">
				<CloseOutline class="h-5 w-5" />
			</button>
		</div>
		<TimelineItem title="A bite for everyone" date="2024 November 29th" classLi="!mb-7">
			<p>
				On the menu, a smörgås-board of options: save/load the current board state, export it as an
				image or just reset it. Outside the track, officials get a lane. For the record, you get a
				countdown and a time tracker. And finally Derbyboard gets a brand new brand!
			</p>
		</TimelineItem>
		<TimelineItem title="It's (skating) official!" date="2024 November 23th" classLi="!mb-7">
			<p>We welcome skating officials on board. Please behave.</p>
		</TimelineItem>
		<TimelineItem title="Covering your track" date="2024 November 20th" classLi="!mb-7">
			<p>Quick, take cover! Here, pivots stripe and jammers star.</p>
		</TimelineItem>
		<TimelineItem title="Second chance" date="2024 November 19th" classLi="!mb-7">
			<p>Before saving a recording, you get a chance to review it. Annoying, right?</p>
		</TimelineItem>
		<TimelineItem title="Derbyboard is out!" date="2024 November 18th" classLi="!mb-7">
			<p>
				There's a track, players move and the pack is visible along with the engagement zone. Record
				along with audio now directly from your browser!
			</p>
		</TimelineItem>
	</Timeline>
</Drawer>
