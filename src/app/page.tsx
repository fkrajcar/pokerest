'use client'

import { addDoc, collection } from 'firebase/firestore'
import styles from './page.module.css'
import { database } from '../firebase/config'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, LoadingOverlay } from '@mantine/core'

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
    } finally {
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
    <main className={styles.main}>
      <Button onClick={createNewRoom} disabled={isLoading}>
        Create room
      </Button>
    </main>
  )
}
