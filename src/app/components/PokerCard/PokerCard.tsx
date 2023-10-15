import { Paper } from '@mantine/core'
import classes from './PokerCard.module.css'
import clsx from 'clsx'

export interface IPokerCardParams {
  value?: number
  selectedEstimate?: number
  // eslint-disable-next-line
  setEstimateOnUser?: (estimate: number) => void
  displayOnly?: boolean
  displayValue?: boolean
}

export const PokerCard = ({
  value,
  setEstimateOnUser,
  selectedEstimate,
  displayOnly = false,
  displayValue = true,
}: IPokerCardParams) => {
  const onClickAction = () => {
    if (!setEstimateOnUser || !value) {
      return
    }

    setEstimateOnUser(value)
  }
  return (
    <Paper
      withBorder
      radius="md"
      key={`estimate-Button-${value}`}
      onClick={() => onClickAction()}
      color="red"
      className={clsx(
        classes.card,
        !displayOnly && classes.action,
        selectedEstimate && selectedEstimate !== value && classes.disabled,
        !!value && displayOnly && classes.choosen
      )}
    >
      {displayValue && value}
    </Paper>
  )
}
