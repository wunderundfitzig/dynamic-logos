/** @jsx h */
import { h, Component } from 'preact'
import Sector from 'paths-js/sector'
import Chroma from 'chroma-js'
import styles from '~/components/sectors.sass'

const range = ([ from, to ]) => {
  let range = Array(to - from + 1).fill()
  return range.map((_, i) => from + i)
}

export default class Sectors extends Component {
  static TWO_PI = 2 * Math.PI

  constructor (props) {
    super()
    this.colorScale = Chroma.scale([
      'FFFFFF',
      'FEF5E2',
      'FED89A',
      'FEC349',
      '86D0CB',
      '38B7A8',
      '828BBF',
      '46558B',
      '29255C'
    ]).domain(range(props.valueRange))

    // add some offset to values based on index
    // so they dont move all at the same time
    this.state.variatedValues = props.values.map((value, index) => value - 1 + index * 0.3)
  }

  componentDidMount () {
    this.animationIsMovingOutwards = []
    window.requestAnimationFrame(this.animate)
  }

  animate = (timestamp) => {
    const REDUCE_SPEED = 1500
    const REDUCE_BOUND_EFFECT = 2
    const minimum = this.props.valueRange[0]
    const maximum = this.props.valueRange[1]
    const variation = this.props.variation

    const step = (timestamp - this.lastTimestamp || 0) / REDUCE_SPEED
    this.lastTimestamp = timestamp

    const variatedValues = this.state.variatedValues.map((variatedValue, index) => {
      const isMovingOutwards = this.animationIsMovingOutwards[index]

      // if the animation moves inwards just invert all the values
      // so we can use the same instructions
      if (!isMovingOutwards) variatedValue *= -1
      const maxValue = isMovingOutwards ? maximum : minimum * -1
      const orgValue = isMovingOutwards ? this.props.values[index]
                                        : this.props.values[index] * -1

      const maxVariation = Math.min(orgValue + variation, maxValue)
      let leeway = maxVariation - variatedValue + 1
      let newVariatedValue = variatedValue + step
      newVariatedValue = variatedValue + step * leeway / REDUCE_BOUND_EFFECT

      if (newVariatedValue > maxValue) newVariatedValue = maxValue
      if (newVariatedValue >= maxVariation) {
        this.animationIsMovingOutwards[index] = !isMovingOutwards
      }

      return isMovingOutwards ? newVariatedValue : newVariatedValue * -1
    })

    this.setState({ variatedValues }, () => { window.requestAnimationFrame(this.animate) })
  }

  render ({ center, values, valueRange }, { variatedValues }) {
    const parts = variatedValues.map((value, index) => ({
      path: Sector({
        center: center,
        r: 0,
        R: value,
        start: Sectors.TWO_PI * index / variatedValues.length,
        end: Sectors.TWO_PI * (index + 1) / variatedValues.length
      }).path.print(),
      color: this.colorScale(value)
    }))

    return <svg className={styles.sectors} viewBox='0 0 30 30'>
      { range(valueRange).map(value =>
        <circle cx={center[0]} cy={center[1]}
          r={value}
          fill='none'
          stroke-width='0.06'
          stroke={this.colorScale(value)} />
      )}

      { parts.map(({ path, color }) =>
        <path d={path} fill={color} stroke-width='0.06' stroke='white' />
      )}
    </svg>
  }
}
