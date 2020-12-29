class InstructionProps {
  static toScheme() {
    return {
      
    }
  }
}

/**
 * @type {import('vue/types/umd').Component}
 */
const Instruction = {
  name: 'DNInstruction',

  functional: true,

  props: InstructionProps.toScheme(),

  render(h, { scopedSlots }) {
    return (
      <div class="dn-instruction">
        {scopedSlots.default()}
      </div>
    )
  }
}

export default Instruction
