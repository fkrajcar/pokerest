'use client'

import { addDoc, collection } from 'firebase/firestore'
import { database } from '../firebase/config'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  ActionIcon,
  Button,
  Container,
  Group,
  LoadingOverlay,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons-react'
import cx from 'clsx'
import classes from './Demo.module.css'

const dbInstance = collection(database, 'rooms')

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const saveRoom = () => {
    return addDoc(dbInstance, {
      displayEstimates: false,
    })
  }

  const createNewRoom = async () => {
    setIsLoading(true)

    try {
      const response = await saveRoom()

      if (response.id) {
        await router.push(`/room/${response.id}`)
      }
    } catch (e) {
      console.error(e)
      setIsLoading(false)
    }
  }
  const { setColorScheme } = useMantineColorScheme()

  // -> computedColorScheme is 'light' | 'dark', argument is the default value
  const computedColorScheme = useComputedColorScheme('light')

  // Correct color scheme toggle implementation
  // computedColorScheme is always either 'light' or 'dark'
  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }
  if (isLoading) {
    return (
      <LoadingOverlay
        visible={true}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
      />
    )
  }

  return (
    <Container py="md">
      <Button onClick={toggleColorScheme}>
        {/* {colorScheme === 'dark' ? 'Light' : 'Dark'} */}
        toggle
      </Button>
      <ActionIcon
        onClick={() =>
          setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')
        }
        variant="default"
        size="xl"
        aria-label="Toggle color scheme"
      >
        <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
        <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
      </ActionIcon>

      <Group justify="center">
        <Button onClick={createNewRoom} disabled={isLoading}>
          Create new room
        </Button>
      </Group>
    </Container>
  )
}
