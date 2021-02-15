import { Size } from './size'

/**
 *
 * @param {{
 *  name: string
 *  operator: Function
 * }}
 */
const binaryOperationTest = ({ name, operator }) => {
  const [width1, height1] = [10, 10]
  const [width2, height2] = [20, 20]
  const [resWidth, resHeight] = [
    operator(width1, width2),
    operator(height1, height2),
  ]

  const size1 = new Size(width1, height1)
  const size2 = new Size(width2, height2)
  const resSize = size1[name](size2)

  expect(resSize.width).toBe(resWidth)
  expect(resSize.height).toBe(resHeight)
}

test('Size add(+) method', () => {
  binaryOperationTest({ name: 'add', operator: (a, b) => a + b })
})

test('Size subtract(-) method', () => {
  binaryOperationTest({ name: 'subtract', operator: (a, b) => a - b })
})

test('Size multiply(*) method', () => {
  binaryOperationTest({ name: 'multiply', operator: (a, b) => a * b })
})

test('Size divide(/) method', () => {
  binaryOperationTest({ name: 'divide', operator: (a, b) => a / b })
})

test('Size modulo(%) method', () => {
  binaryOperationTest({ name: 'modulo', operator: (a, b) => a % b })
})
