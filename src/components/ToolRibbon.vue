<script setup lang="ts">

</script>

<template>
  <div class="ribbon">
  <slot></slot>
  </div>
</template>

<style scoped lang="less">
.ribbon {
  height: 60px;
  width: 100%;

  outline: 1px solid grey;
}

</style>