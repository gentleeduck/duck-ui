import { Arrow } from '..'
import styles from './arrow.stories.module.css'

export default {
  title: 'Utilities/Arrow',
}

export const Sizes = () => (
  <div className={styles.page}>
    <Arrow aria-hidden="true" className={styles.arrow} data-arrow="default" />
    <Arrow aria-hidden="true" className={styles.arrow} data-arrow="sized" height={20} width={40} />
  </div>
)

export const CustomShape = () => (
  <div className={styles.page}>
    <Arrow
      aria-hidden="true"
      asChild
      className={styles.arrow}
      data-arrow="sharp"
      height={8}
      viewBox="0 0 14 8"
      width={14}>
      <path d="M0 0h14L7 8z" />
    </Arrow>
    <Arrow
      aria-hidden="true"
      asChild
      className={`${styles.arrow} ${styles.box}`}
      data-arrow="kept"
      height={20}
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 14 8"
      width={60}>
      <path d="M0 0h14L7 8z" />
    </Arrow>
  </div>
)
