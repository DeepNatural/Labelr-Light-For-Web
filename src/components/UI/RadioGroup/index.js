import _ from 'lodash'

class RadioGroupProps {
  
  static toScheme() {
  
    const props = {
      name: String,
      disabled: Boolean,
      value: {
        type: Array,
        default: () => []
      },
      title: String,
      leftLabel: String,
      rightLabel: String,
      val: {
        type: [ Number, String, Boolean ],
        default: 0
      },
      numberic: Boolean
    }
    return props
  }
}

const DNRadioGroup = {
  name: 'DNRadioGroup',

  props: RadioGroupProps.toScheme(),

  data: () => ({
    internalSelected: null
  }),



  watch: {
    val (v) {
      this.internalSelected = v
    }
  },
  
  methods: {

    onClickItem(e, val) {
      e.preventDefault()
      this.internalSelected = val
      this.$emit('click', val)
    },
    
    renderItems(h) {
      return this.value.map((value, index) => (
        <div 
          onClick={(e) => this.onClickItem(e, index)}
          class={ this.val == index ? 'radio-item checked' : 'radio-item' }>
          <label class="radio-label" for={this.name + index}>
            {this.numberic ? index : value} 
            <input type="radio" 
              name={this.name} 
              value={this.numberic ? index : value}
              v-model={this.internalSelected}
              id={this.name + index}
            />
          </label>
        </div>
			))
    }



  },

  render(h) {
    const renderItems = _.partial(this.renderItems, h)

    return (
      <div class="dn-ui-radio-group">
        <div class="title-container">
          {this.title}
        </div>
        <div class="radio-container">
          <span>{this.leftLabel}</span>
          <div class="radio-group">
            {renderItems()}
          </div> 
          <span>{this.rightLabel}</span>
        </div>
      </div>
    )

  }

}

export default DNRadioGroup
