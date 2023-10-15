import { Progress, Text, Group, Badge, Paper, rem } from '@mantine/core'
import classes from './EstimateCard.module.css'

interface IEstimateCardProps {
  value: number
  displayData: boolean
}
export const EstimateCard = ({ value, displayData }: IEstimateCardProps) => {
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
          1
        </Text>
        <Text fz="sm" c="dimmed">
          24
        </Text>
      </Group>

      <Progress
        color="blue.5"
        value={displayData ? (value / 24) * 100 : 0}
        mt={5}
      />
    </Paper>
  )
}
