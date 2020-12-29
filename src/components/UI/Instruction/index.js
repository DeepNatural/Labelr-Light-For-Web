class InstructionProps {
  /**
   * @typedef TypeInstructionProps
   * @prop {string} title
   * @prop {string} description
   */
  static toScheme() {
    return {
      title: String,
      description: String,
    }
  }
}

/**
 * @type {import('vue/types/umd').Component}
 */
const Instruction = {
  name: 'Instruction',

  props: InstructionProps.toScheme(),

  render(h) {
    const { title, description } = this

    return (
      <div class="ui segment basic">
        <div class="dn-w-c-task-header">
          <header>
            <label class="small bold">Task Instruction</label>
            <div>
              <span>{ title }</span>
            </div>
          </header>

          <div class="description">
            <div>{ description }</div>
          </div>
        </div>
      </div>
    )
  }
}

export default Instruction
