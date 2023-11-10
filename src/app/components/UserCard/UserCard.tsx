import { Card, Group, Text, ActionIcon, rem } from '@mantine/core'
import classes from './UserCard.module.css'
import { IconX } from '@tabler/icons-react'
import { IUser } from '@/app/room/[id]/page'
import { PokerCard } from '../PokerCard/PokerCard'
import { estimationValues } from '@/app/constants/estimations'

export interface IUserCardParams {
  user: IUser
  displayEstimate: boolean
  // eslint-disable-next-line
  removeFromRoom: (user: IUser) => void
}

export const UserCard = ({
  user,
  displayEstimate,
  removeFromRoom,
}: IUserCardParams) => {
  const estimateToLabel = (estimateValue?: number) => {
    if (!estimateValue) {
      return ''
    }

    const estimate = estimationValues.find(
      ({ value }) => value === estimateValue
    )

    if (!estimate?.label) {
      return ''
    }

    return estimate.label
  }

  return (
    <Card withBorder radius="md" p="md" className={classes.card}>
      <Card.Section className={classes.section} p="md">
        <Group justify="apart">
          <Text className={classes.label}>{user.username}</Text>
          <ActionIcon
            size={16}
            color="red"
            aria-label="ActionIcon with size as a number"
            onClick={() => removeFromRoom(user)}
            className={classes.closeButton}
          >
            <IconX style={{ width: rem(16), height: rem(16) }} />
          </ActionIcon>
        </Group>
      </Card.Section>
      {
        <PokerCard
          displayValue={displayEstimate}
          displayOnly={true}
          value={user.estimate}
          label={estimateToLabel(user.estimate)}
        />
      }
    </Card>
  )
}
