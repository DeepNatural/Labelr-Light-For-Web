<template>
  <div class="label-groups">
    <dn-ui-labeling-group
      v-for="(groupName, i) in labels"
      @select="label => onSelect(i, label)"
      @clickLabel="label => onClickLabel(i, label)"
      @removeLabel="label => onRemoveLabel(i, label)"
      :key="i"
      :name="groupName"
      :color="colors[i]"
      :labels="polygons.filter(v => v.name === groupName).map(v => v.index)"
    />
  </div>
</template>

<script>
import { RGBA } from '@/utils'

export default {
  name: 'PolygonLabels',

  props: {
    labelGroups: {
      type: Array,
      default: () => []
    },

    polygons: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    colors() {
      if(this.labelGroups[0].constructor === Array) {
        return this.labelGroups?.map((l) => l[1])
      }
      return Object.values(RGBA.DN_COLOR_NAMES).map(v => v.name)
    },
    
    labels () {
      if(this.labelGroups[0].constructor === Array) {
        return this.labelGroups?.map((l) => l[0])
      }
      return this.labelGroups
    }
  },

  methods: {
    onSelect(index, label) {
      this.$emit('select', {
        index,
        label,
        color: Object.values(RGBA.DN_COLOR_NAMES)
          .filter(r => r.name === this.colors[index])[0].code
      })
    },

    onClickLabel(index, label) {
      this.$emit('clickLabel', { index, label })
    },

    onRemoveLabel(index, label) {
      this.$emit('removeLabel', { index, label })
    }
  }
}
</script>

<style lang="scss" scoped>
.label-groups {
  padding: 1.25rem;
}
</style>
