<template>
  <div class="annotation-list" @click="deselectItem">
    <div class="instance-list">
      <div class="instance-list-header flex justify-between items-center">
        <div class="instance-list-title flex">
          <div
            @click.stop="collapseInstanceList"
            class="instance-list-accordion"
            :class="{ collapsed: instances.collapsed }"
          >
            <dn-ui-icon type="material" name="play_arrow" size="24" />
          </div>
          <div>
            레이블
          </div>
        </div>
        <div class="instance-add">
          <dn-ui-button @click="addInstance()">
            <dn-ui-icon name="plus" style="margin-right: 8px;" />
            <span class="instance-add-text"> {{ instanceName }} 추가 </span>
          </dn-ui-button>
        </div>
      </div>

      <div
        class="instance-tile"
        :class="{ selected: instances.selectedIndex === idx }"
        :ref="`instance-tile-${idx}`"
        v-for="(instance, idx) in instances.list"
        :key="instance.id"
        @click.stop="selectInstance(instance)"
      >
        <div class="instance-tile-header">
          <div
            @click.stop="collapseInstance(instance)"
            class="instance-accordion"
            :class="{ collapsed: instance.collapsed }"
          >
            <dn-ui-icon type="material" name="play_arrow" size="24" />
          </div>
          <div class="instance-name">{{ instanceName }} #{{ idx + 1 }}</div>
          <div style="flex-grow:1; "></div>
          <div class="instance-actions">
            <div class="instance-action" @click.stop="toggleInstance(instance)">
              <dn-ui-icon
                type="material"
                :name="instance.visible ? 'visibility' : 'visibility_off'"
                size="18"
              />
            </div>
            <div class="instance-action" @click.stop="deleteInstance(instance)">
              <dn-ui-icon type="material" name="delete" size="18" />
            </div>
          </div>
        </div>

        <div v-if="instance.collapsed" class="annotation-tile-collapsed"></div>

        <div v-else class="annotation-tile-list">
          <div
            v-for="(annotation, idx) in instance.list"
            :key="annotation.id"
            class="annotation-tile"
            :class="{ selected: annotation.item.selected }"
            @click.stop="e => selectAnnotation(e, annotation)"
          >
            <div
              class="annotation-name"
              :style="`border-left: 4px solid ${annotation.spec.color}`"
            >
              {{ annotation.name }} #{{ idx + 1 }}
            </div>

            <div class="annotation-actions">
              <div
                class="annotation-action"
                @click.stop="toggleAnnotation(annotation)"
              >
                <dn-ui-icon
                  type="material"
                  :name="
                    annotation.item.visible ? 'visibility' : 'visibility_off'
                  "
                  size="18"
                />
              </div>
              <div
                class="annotation-action"
                @click.stop="deleteAnnotation(annotation)"
              >
                <dn-ui-icon type="material" name="delete" size="18" />
              </div>
            </div>
          </div>
        </div>

        <div class="instance-tile-info">
          {{ instance.validationMsg }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Annotation, Instance } from './model'
export default {
  name: 'DNImageAnnotationList',

  props: {
    instances: Object,

    instanceName: String,
  },

  watch: {
    /**
     * 선택된 인스턴스 변경 시 해당 인스턴스 타일로 스크롤링함
     */
    async 'instances.selectedIndex'(idx) {
      await this.$nextTick()
      this.$refs[`instance-tile-${idx}`]?.[0]?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'end',
      })
    },
  },

  methods: {
    /**
     * @param {Event} e
     * @param {Annotation} annotation */
    selectAnnotation(e, annotation) {
      const selectedItems = paper.project.getItems({ selected: true })
      if (selectedItems.length === 1 && selectedItems[0] === annotation.item) {
        return (annotation.item.selected = false)
      }

      if (!e.ctrlKey) paper.project.activeLayer.selected = false
      annotation.item.selected = !annotation.item.selected
    },

    collapseInstanceList() {
      this.$emit('instanceListCollapse')
    },

    /**
     * @param {Instance} instance
     */
    collapseInstance(instance) {
      this.$emit('instanceCollapse', instance)
    },

    addInstance() {
      this.$emit('instanceAdd')
    },

    selectInstance(instance) {
      this.$emit('instanceSelect', instance)
    },

    /**
     * @param {Annotation} annotation
     */
    deleteAnnotation(annotation) {
      this.$emit('annotationDelete', annotation)
    },

    /**
     * @param {Instance} instance
     */
    deleteInstance(instance) {
      this.$emit('instanceDelete', instance)
    },

    /**
     * @param {Annotation} annotation
     */
    toggleAnnotation(annotation) {
      this.$emit('annotationToggle', annotation)
    },

    /**
     * @param {Instance} instance
     */
    toggleInstance(instance) {
      this.$emit('instanceToggle', instance)
    },

    metaLabelSelect() {
      this.$emit('metaLabelSelect')
    },

    deselectItem() {
      paper.project.activeLayer.selected = false
    },
  },
}
</script>

<style scoped lang="scss">
@import '../../../../styles/theme.scss';

.instance {
  width: 100%;

  &-list {
    box-shadow: inset 0 -1px 0 0 #ddd;

    &-header {
      box-shadow: 1px 1px #efefef;
    }

    &-title {
      font-weight: bold;
      padding: 16px;
      padding-left: 8px;
      user-select: none;
    }

    &-accordion {
      margin-right: 4px;
      transform: rotate(90deg);
      cursor: pointer;

      &.collapsed {
        transform: rotate(0deg);
      }
    }
  }

  &-add {
    margin-right: 16px;

    &-text {
      display: inline-block;
      margin-bottom: 2px;
    }
  }

  &-tile {
    user-select: none;
    cursor: pointer;
    padding: 4px 8px;
    padding-bottom: 6px;

    &:not(:last-of-type) {
      box-shadow: inset 0 -1px 0 0 #ddd;
    }

    font-size: 0.75rem;

    &-header {
      display: flex;
      align-items: center;
      align-content: center;

      padding-right: 8px;
      margin: 2px 4px 2px 0;
      font-weight: 500;
      font-size: 0.8rem;
    }

    &.selected {
      outline: 2px solid $color-blue;
      outline-offset: -3px;
    }

    &-info {
      font-size: 0.75rem;
      color: red;
      margin: 0 8px;
    }
  }

  &-accordion {
    padding-top: 4px;
    margin-right: 4px;
    transform: rotate(90deg);

    &.collapsed {
      transform: rotate(0deg);
    }
  }

  &-actions {
    display: flex;
  }

  &-action {
    padding: 0 8px;

    &:last-child {
      padding-right: 4px;
    }
  }
}

.annotation {
  &-list {
    &-title {
      font-weight: bold;
      padding: 16px;
    }
    height: 100%;
  }

  &-tile {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    width: 100%;
    cursor: pointer;
    user-select: none;

    &-list &:not(:last-child) {
      box-shadow: inset 0 -1px 0 0 #efefef;

      .night & {
        box-shadow: inset 0 -1px 0 0 rgba(255, 255, 255, 0.1);
      }
    }

    &.selected {
      background-color: rgba(196, 196, 196, 0.3);

      .night & {
        background-color: rgba(196, 196, 196, 0.1);
      }
    }

    &:hover {
      background-color: rgba(196, 196, 196, 0.3);

      .night & {
        background-color: rgba(196, 196, 196, 0.1);
      }
    }

    &-placeholder {
      color: #777;
      margin: 0 4px;
    }
  }

  &-name {
    padding-left: 10px;
  }

  &-actions {
    display: flex;
  }

  &-action {
    padding: 0 8px;
    margin: 4px 0;
  }
}
</style>

<style lang="scss">
.instance-meta-label {
  margin-left: 8px;
  font-weight: normal;

  &-dropdown {
    border: 2px solid #ddd;
    border-radius: 8px;
    width: 100px;
    padding-left: 4px;
    height: 28px !important;

    & .ui.dropdown {
      min-width: 80px !important;

      height: 24px !important;
      min-height: 0 !important;
      line-height: 0 !important;

      .text {
        height: 22px;
        line-height: 1.5rem !important;
      }

      .dropdown.icon {
        height: 24px !important;
        line-height: 0.4rem !important;
      }
    }
  }
}
</style>
