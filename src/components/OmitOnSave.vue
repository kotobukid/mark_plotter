<script setup lang="ts">
import {inject, type Ref} from "vue";
const saving = inject('saving') as Ref<boolean>;
</script>

<template lang="pug">
slot(v-if="!saving")
</template>

<style scoped lang="less">

</style>