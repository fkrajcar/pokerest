import { Button, Paper, Text, useMantineColorScheme } from '@mantine/core'
import classes from './PokerCard.module.css'
import clsx from 'clsx'

export interface IPokerCardParams {
  value?: number
  label?: string
  selectedEstimate?: number
  // eslint-disable-next-line
  setEstimateOnUser?: (estimate: number) => void
  displayOnly?: boolean
  displayValue?: boolean
  disableAction?: boolean
}

export const PokerCard = ({
  value,
  label,
  setEstimateOnUser,
  selectedEstimate,
  displayOnly = false,
  displayValue = true,
  disableAction = false,
}: IPokerCardParams) => {
  const onClickAction = () => {
    if (!setEstimateOnUser || !value) {
      return
    }

    setEstimateOnUser(value)
  }
  const { colorScheme } = useMantineColorScheme()

  return displayOnly ? (
    <Paper
      withBorder
      radius="md"
      key={`estimate-Button-${value}`}
      onClick={() => onClickAction()}
      color="red"
      className={clsx(
        classes.card,
        !displayOnly && classes.action,
        disableAction && classes.disabled,
        selectedEstimate && selectedEstimate === value && classes.selected,
        !!value && displayOnly && classes.choosen,
        colorScheme === 'dark' && classes.dark_border
      )}
    >
      <Text
        className={clsx(
          classes.card_text,
          colorScheme === 'dark' && classes.card_text_dark
        )}
      >
        {displayValue && (label ?? value)}
      </Text>
    </Paper>
  ) : (
    <Button
      radius="md"
      key={`estimate-Button-${value}`}
      onClick={() => onClickAction()}
      className={clsx(
        classes.card,
        !displayOnly && classes.action,
        disableAction && classes.disabled,
        selectedEstimate && selectedEstimate === value && classes.selected,
        !!value && displayOnly && classes.choosen,
        colorScheme === 'dark' && classes.dark_border
      )}
    >
      <Text
        className={clsx(
          classes.card_text,
          colorScheme === 'dark' && classes.card_text_dark
        )}
      >
        {displayValue && (label ?? value)}
      </Text>
    </Button>
  )
}
