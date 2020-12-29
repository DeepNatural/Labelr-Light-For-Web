<template>
  <div class="annotation-header-progress-bar">
    <dn-ui-progress-bar v-model="value" />
  </div>
</template>

<script>
export default {
  name: 'DNAnnotationHeaderProgressBar',

  model: {
    prop: 'value'
  },

  props: {
    value: [ Number, String ]
  }
}
</script>

<style lang="scss">
.annotation-header-progress-bar {
  display: inline-block;
  margin: 0 .75rem;
  width: 5rem;
  height: 4px;
  vertical-align: middle;
}
</style>
