<template>
	<div class="page404">
		<h1 class="page404-title">404</h1>
		<p class="page404-p" v-if="this.$session.get('lang') == 'fr'">On dirait que vous vous êtes perdus dans un autre univers.</p>
		<p class="page404-p" v-else>like you got lost in another multiverse.</p>
	</div>
</template>