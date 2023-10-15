import { Paper } from '@mantine/core'
import classes from './PokerCard.module.css'
import clsx from 'clsx'

export interface IPokerCardParams {
  value: number
  selectedEstimate?: number
  setEstimateOnUser: (estimate: number) => {}
}

export const PokerCard = ({
  value,
  setEstimateOnUser,
  selectedEstimate,
}: IPokerCardParams) => {
  return (
    <Paper
      withBorder
      radius="md"
      key={`estimate-Button-${value}`}
      onClick={() => setEstimateOnUser(value)}
      color="red"
      className={clsx(
        classes.card,
        selectedEstimate && selectedEstimate !== value && classes.disabled
      )}
    >
      {value}
    </Paper>
  )
}
