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
        size="xl"
        className={classes.icon}
        style={{ fontSize: 24, minWidth: rem(92), height: rem(92) }}
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

      <Progress value={displayData ? (value / 24) * 100 : 0} mt={5} />
    </Paper>
  )
}
