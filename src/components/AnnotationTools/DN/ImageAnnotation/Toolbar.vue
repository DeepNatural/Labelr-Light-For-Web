<template>
  <div class="polygon-toolbar">
    <span
      v-for="(tool, toolIdx) in tools"
      :key="toolIdx"
      class="tool-button-wrapper"
    >
      <dn-ui-button
        class="tool-button"
        :class="{ active: tool.active }"
        v-if="isDrawTool(tool)"
        @click="activateTool(toolIdx)"
      >
        <img v-if="tool.spec.icon" :src="tool.spec.icon" />

        {{ tool.spec.name }} 그리기
        <span
          v-if="tool.active && tool.spec.length"
          class="tool-progress"
          key="{tool.currentPathLength}"
        >
          {{ tool.currentPathLength }} / {{ tool.spec.length }}
        </span>
        <div class="shortcut">
          {{ toolIdx + 1 }}
        </div>
      </dn-ui-button>

      <dn-ui-button
        v-else
        class="tool-button"
        :class="{ active: tool.active }"
        @click="activateTool(tools.length - 1)"
      >
        <dn-ui-icon name="select" />
        <span class="tool-button-text">수정하기</span>
        <div class="shortcut">
          {{ toolIdx + 1 }}
        </div>
      </dn-ui-button>
    </span>
  </div>
</template>

<script>
import { PolylineDrawTool } from './tools/polyline'
import { BBoxDrawTool } from './tools/bbox/draw'

export default {
  name: 'DNPolygonToolbar',

  props: {
    tools: Array,

    activateTool: Function,
  },

  methods: {
    isDrawTool(tool) {
      return tool instanceof PolylineDrawTool || tool instanceof BBoxDrawTool
    },
  },
}
</script>

<style scoped lang="scss">
.polygon-toolbar {
  display: flex;
  align-content: center;

  .tool-button {
    position: relative;
    display: flex;
    align-items: center;

    .tool-progress {
      margin-left: 4px;
    }

    &-text {
      margin-right: 6px;
    }

    &.active {
      box-shadow: inset 0 0 0 2px #00c1c6 !important;
    }

    &-wrapper {
      position: relative;
      margin-right: 16px;
    }

    .shortcut {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 12px;
      height: 12px;
      background-color: inherit;
      line-height: 10px;
      border-radius: 2px;
      font-size: 10px;
      box-sizing: content-box;
      border: 1px solid #191927;
    }
  }
}
</style>
