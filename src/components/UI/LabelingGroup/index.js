import _ from 'lodash'
import { fromEvent } from 'rxjs'
import { map, filter } from 'rxjs/operators'

class LabelingGroupProps {
  /**
   * @typedef TypeLabelingGroupProps
   * @prop {boolean} selected
   * @prop {string} color
   * @prop {string} name
   * @prop {number[]} labels
   * @prop {string | number} shortcut
   */
  static toScheme() {
    /**
     * @type {import('vue/types/options').PropsDefinition<TypeLabelingGroupProps>}
     */
    const props = {
      selected: Boolean,
      color: String,
      name: String,
      labels: Array,
      shortcut: [String, Number]
    }

    return props
  }
}

/** @type {import('vue').ComponentOptions} */
const LabelingGroup = {
  name: 'DNLabelingGroup',

  data: () => ({
    expanded: true,
    _shortcutSubscription: null
  }),

  props: LabelingGroupProps.toScheme(),

  computed: {
    lastLabel() { return _.last(this.labels) ?? -1 }
  },

  methods: {
    toggle() { this.expanded = !this.expanded },

    // add() {
    //   const { labels } = this
      
    //   labels.push((_.last(labels) ?? 0) + 1)
    //   this.$emit('addSubLabeling', { labels })
    // },

    select() { this.$emit('select', this.lastLabel + 1) },

    /**
     * @param {number} label
     */
    removeLabel(label) { this.$emit('removeLabel', label) },

    // /**
    //  * @param {number} index
    //  */
    // select(index) {
    //   this.$emit('selectSubLabeling', { label: this.labels[index] })
    // },

    _renderBtnExpand(h) {
      const icon = this.expanded ? 'collapse' : 'expand'

      return (
        <dn-ui-button
          class={{ [`btn-${icon}`]: true }}
          onClick={e => {
            e.stopPropagation()
            this.toggle()
          }}
        >
          <dn-ui-icon name={icon} />
        </dn-ui-button>
      )
    },

    _renderLabels(h) {
      return this.labels.map((label, index) => (
        <div
          key={index}
          class="label-item"
          onClick={() => this.$emit('clickLabel', label)}
        >
          <span>#{ label }</span>
          <dn-ui-button onClick={() => this.removeLabel(label)}>
            <dn-ui-icon type="material" name="delete" size="14" />
          </dn-ui-button>
        </div>
      ))
    }
  },

  mounted() {
    const { shortcut } = this

    this._shortcutSubscription = fromEvent(window, 'keypress')
      .pipe(
        map(e => e.key),
        filter(key => key === '' + shortcut)
      )
      .subscribe(() => this.select())
  },

  destroyed() {
    this._shortcutSubscription?.unsubscribe()
  },

  render(h) {
    const { selected, shortcut, expanded, name, color } = this
    const renderBtnExpand = _.partial(this._renderBtnExpand, h)
    const renderLabels = _.partial(this._renderLabels, h)

    return (
      <div
        class={{
          'dn-labeling-group': true,
          small: true,
          selected
        }}>
        <div
          onClick={() => this.select()}
          class="labeling-group-name"
        >
          <i class={`labeling-color ${color}`}></i>
          <div class="name">
            <span>{ name }</span>
            
            {
              '' + shortcut ?
              <div class="shortcut">
                <dn-ui-icon name="keypad" size="20" />
                <span>{ shortcut }</span>
              </div> : null
            }
          </div>

          {renderBtnExpand()}
        </div>

        <transition name="slide">
          <div style={{ display: expanded ? undefined : 'none' }}>
            <transition-group
              tag="div"
              class="labeling-list"
              name="slider"
            >
              {renderLabels()}
              </transition-group>
            {/* <dn-ui-button
              onClick={this.add}
              class="btn-add"
            >
              Add
            </dn-ui-button> */}
          </div>
        </transition>
      </div>
    )
  }
}

export default LabelingGroup
