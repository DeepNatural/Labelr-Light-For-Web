import _ from 'lodash'
import { fromEvent } from 'rxjs'
import { map, filter } from 'rxjs/operators'

/**
 * @typedef LabelsProps
 * @prop {string[]} labels
 */
class LabelsProps {
	static toScheme() {
		/**
		 * @type {import('vue/types/options').PropsDefinition<LabelsProps>} 
		 */
		const props = {
			labels: Array,
      selected: [ Boolean, String, Number ],
			disabled: Boolean,
			keyMap: {
        type: [ Object, Array ],
        default: () => {
          return ['1','2','3','4','5','6','7','8','9','0']
        }
      },
      keyStartIndex: {
        type: Number,
        default: 0
      }
		}

		return props
	}
}

/**
 * @type {import('vue/types/umd').ComponentOptions}
 */
const DNLabels = {
	name: 'DNLabels',

	data: () => ({
    _shortcutSubscription: null,
    internalSelected: null
  }),

	props: LabelsProps.toScheme(),

	mounted() {
    const { $el, keyMap } = this

    this._shortcutSubscription = fromEvent(window, 'keypress')
      .pipe(
				filter(e => e.target === document.body || $el.hasChildNodes(e.target)),
				filter(e => keyMap.includes(e.key)),
        map(e => e.key.toUpperCase())
      )
      .subscribe(key => {
				this.onKeyClick(key)
      })
  },
  
  watch: {
    selected (v) {
      this.internalSelected = '' + v
    }
  },
	
	destroyed() {
    this._shortcutSubscription?.unsubscribe()
  },

	methods: {
		onKeyClick(key) {
      if(!this.disabled) {
				this.labels?.map((label, index) => {
					if(key == this.keyMap[this.keyStartIndex + index]) {
						this.internalSelected = '' + key
						this.$emit('click', key)
					}
				})
      }
		},
		
		_renderLabels(h) {
			const { disabled, keyMap, keyStartIndex } = this
			return this.labels.map((label, index) => (
				<div 
					class="label-item"
					onClick={() => this.onKeyClick(keyMap[keyStartIndex + index])}
				>
					<div class="label-item-text">
						<dn-ui-checkbox
							v-model={this.internalSelected}
							type="radio"
							label={label}
							id={label}
							val={ keyMap[keyStartIndex + index] }
              name="labels"
              disabled={disabled}
						>
						</dn-ui-checkbox>
					</div>
					<div class="label-item-icon">
						<dn-ui-icon name="keypad" size="20" />
						<span> { keyMap[keyStartIndex + index] } </span>
					</div>
				</div> 
			))
		}
	},

	render(h) {
		const renderLabels = _.partial(this._renderLabels, h)

		return (
			<div class="dn-ui-lables">
				{renderLabels()}
			</div>
		)
	}

}

export default DNLabels
