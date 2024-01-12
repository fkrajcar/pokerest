'use client'

import { addDoc, collection } from 'firebase/firestore'
import { database } from '../firebase/config'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, Container, Group, LoadingOverlay } from '@mantine/core'
import ColorSchemeToggle from './components/ColorSchemeToggle/ColorSchemeToggle'

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
      <ColorSchemeToggle />

      <Group justify="center">
        <Button onClick={createNewRoom} disabled={isLoading}>
          Create new room
        </Button>
      </Group>
    </Container>
  )
}
