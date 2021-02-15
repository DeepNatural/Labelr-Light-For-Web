import { Rectangle } from './rectangle'
import { Size } from './size'
import { Point } from './point'

/**
 *
 * @param {{
 *  name: string
 *  operator: Function
 * }}
 */

test('Rectangle constructor(point, size)', () => {
  const point = new Point(10, 10)
  const size = new Size(10, 10)

  const rect = new Rectangle(point, size)

  expect(rect.point.equals(point)).toBeTruthy()
  expect(rect.size.equals(size)).toBeTruthy()
})

test('Rectangle constructor(point, point)', () => {
  const point1 = new Point(10, 10)
  const point2 = new Point(20, 20)

  const rect = new Rectangle(point1, point2)

  expect(rect.point.equals(point1)).toBeTruthy()
  expect(rect.size.equals(new Size(10, 10))).toBeTruthy()
})
