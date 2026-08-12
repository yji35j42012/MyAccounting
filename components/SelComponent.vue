<style scoped></style>

<template>
	<div :class="['normal_sel', isShow ? 'on' : '']" @click="selHandler" ref="menuRef">
		<span class="normal_sel_txt">{{ this.selType.selText }}</span>
		<ul class="normal_sel_ul">
			<template v-for="( item, index) in  this.selType.lists">
				<li :class="['normal_sel_li', item == this.selType.selText ? 'on' : '']" @click="itemHandler(item)">{{
		item }}
				</li>
			</template>
		</ul>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
			stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
			class="lucide lucide-chevron-down size-4 opacity-50" data-loc="client/src/components/ui/select.tsx:45"
			aria-hidden="true">
			<path d="m6 9 6 6 6-6"></path>
		</svg>
	</div>
</template>


<script>
module.exports = {
	data() {
		return {
			isShow: false,
			sel_text: "",
		};
	},
	props: {
		selType: {
			type: Object
		},
		selText: {
			type: String
		}
	},
	components: {},
	mounted() {
		document.addEventListener('click', this.closeSel);
		this.sel_text = this.selText
	},
	computed: {
		returnText() {
			return selText;
		}
	},
	methods: {
		closeSel() {
			const menu = this.$refs.menuRef;
			if (this.isShow && menu && !menu.contains(event.target)) {
				this.isShow = false;
			}
		},
		selHandler() {
			this.isShow = !this.isShow;
		},
		itemHandler(s, $event) {
			event.stopPropagation();
			this.isShow = false;
			this.sel_text = s;
			this.$emit('sel-return', s);
		}
	}
};
</script>
