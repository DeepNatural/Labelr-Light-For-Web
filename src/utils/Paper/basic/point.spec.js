import { Point } from './point'

/**
 *
 * @param {{
 *  name: string
 *  operator: Function
 * }}
 */
const binaryOperationTest = ({ name, operator }) => {
  const [x1, y1] = [10, 10]
  const [x2, y2] = [20, 20]
  const [resX, resY] = [operator(x1, x2), operator(y1, y2)]

  const point1 = new Point(x1, y1)
  const point2 = new Point(x2, y2)
  const resPoint = point1[name](point2)

  expect(resPoint.x).toBe(resX)
  expect(resPoint.y).toBe(resY)
}

test('Point add(+) method', () => {
  binaryOperationTest({ name: 'add', operator: (a, b) => a + b })
})

test('Point subtract(-) method', () => {
  binaryOperationTest({ name: 'subtract', operator: (a, b) => a - b })
})

test('Point multiply(*) method', () => {
  binaryOperationTest({ name: 'multiply', operator: (a, b) => a * b })
})

test('Point divide(/) method', () => {
  binaryOperationTest({ name: 'divide', operator: (a, b) => a / b })
})

test('Point modulo(%) method', () => {
  binaryOperationTest({ name: 'modulo', operator: (a, b) => a % b })
})

test('Point equlas(==) method', () => {
  const [p1, p2] = [new Point(10, 20), new Point(10, 20)]

  expect(p1.equals(p2)).toBeTruthy()
})
