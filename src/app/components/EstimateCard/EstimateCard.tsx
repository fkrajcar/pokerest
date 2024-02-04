import { Progress, Text, Group, Badge, Paper, rem } from '@mantine/core'
import classes from './EstimateCard.module.css'

interface IEstimateCardProps {
  value: number
  displayData: boolean
}
export const EstimateCard = ({ value, displayData }: IEstimateCardProps) => {
  const getEstimateColor = (estimateValue: number) => {
    if (estimateValue > 24) {
      return 'red'
    }

    if (estimateValue > 16) {
      return 'orange.7'
    }

    if (estimateValue > 8) {
      return 'yellow.7'
    }

    return 'blue.5'
  }
  return (
    <Paper radius="md" withBorder className={classes.card} mt={20}>
      <Badge
        className={classes.icon}
        style={{ minWidth: rem(92), height: rem(92) }}
        color="blue.5"
      >
        {displayData && value.toFixed(1)}
      </Badge>

      <Text ta="center" fw={700} className={classes.title}>
        Estimate
      </Text>

      <Group justify="space-between" mt="xs">
        <Text fz="sm" c="dimmed">
          1h
        </Text>
        <Text fz="sm" c="dimmed">
          40h
        </Text>
      </Group>

      <Progress
        color={getEstimateColor(value)}
        value={displayData ? (value / 40) * 100 : 0}
        mt={5}
      />
    </Paper>
  )
}
