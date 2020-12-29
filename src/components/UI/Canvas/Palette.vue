<template>
  <div
    :class="{
      'palette-container': true,
      vertical
    }"
  >
    <template v-for="tool in tools">
      <dn-ui-button
        v-if="noUseTools.indexOf(tool.name) === -1"
        @click="onToolClick(tool.name)"
        :key="tool.name"
        :class="{
          active: selectedTool.painter === tool.name || selectedTool.controller === tool.name
        }"
      >
        <dn-ui-icon :name="tool.name" />
        <div v-if="tool.shortcut" class="shortcut">
          {{ tool.shortcut }}
        </div>
      </dn-ui-button>
    </template>
  </div>
</template>

<script>
import { differenceBy } from 'lodash'
import { fromEvent } from 'rxjs'
import { map, filter } from 'rxjs/operators'
import { PALETTE_TOOLS } from './palette'

export default {
  name: 'Palette',

  data: () => ({
    _shortcutSubscription: null
  }),

  props: {
    vertical: {
      type: Boolean,
      default: false
    },
    
    noUseTools: {
      type: Array,
      default: () => []
    },

    getCanvas: {
      type: Function,
      required: true
    }
  },

  computed: {
    tools: () => Object.values(PALETTE_TOOLS),

    selectedTool() {
      const selectedTool = this.getCanvas()?.selectedTool
      
      if(!selectedTool) return { painter: null, controller: null }

      const { painter, controller } = selectedTool

      return {
        painter: painter?.name.toLowerCase() ?? '',
        controller: controller?.name.toLowerCase() ?? ''
      }
    }
  },

  methods: {
    /**
     * @param {'box' | 'polygon' | 'point' | 'select' | 'move'} toolName
     */
    onToolClick(toolName) {
      const canvas = this.getCanvas()
      const selectedTool = this.selectedTool
      const { painter } = selectedTool
      let painterName, controllerName

      switch (toolName) {
        case 'box':
        case 'polygon':
        case 'point':
          painterName = painter === toolName ? (controllerName = 'select', '') : toolName
          break
        default:
          controllerName = toolName
      }

      canvas.selectTool({
        painterName,
        controllerName
      })
    }
  },

  mounted() {
    const { $el, tools, noUseTools } = this
    const usedTools = differenceBy(tools, noUseTools, v => {
      if(v.name) return v.name
      return v
    })

    this._shortcutSubscription = fromEvent(window, 'keyup')
      .pipe(
        filter(e => e.target === document.body || $el.hasChildNodes(e.target)),
        map(e => e.key.toLowerCase())
      )
      .subscribe(key => {
        const tool = usedTools.filter(({ shortcut }) => shortcut === key)[0]
        console.debug(`[Canvas][Palette] shortcut: ${key}, tool: ${tool?.name}`)

        tool && this.onToolClick(tool.name)
      })
  },

  destroyed() {
    this._shortcutSubscription?.unsubscribe()
  }
}
</script>

<style lang="scss" scoped>
@import "../../../styles/theme.scss";

.palette-container {
  display: flex;
  align-items: center;
  justify-content: center;

  &.vertical {
    flex-direction: row;
  }

  .dn.ui.button {
    position: relative;
    margin: 0 .5rem;
    padding: 0;
    width: 32px;
    height: 32px;

    &.active {
      box-shadow: inset 0 0 0 2px $color-g-blue;
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
