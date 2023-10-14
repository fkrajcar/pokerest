'use client'

import { addDoc, collection } from 'firebase/firestore'
import styles from './page.module.css'
import { database } from '../firebase/config'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, Loader } from '@mantine/core'

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
    return <Loader speed="0.65s" color="blue" size="xl" />
  }

  return (
    <main className={styles.main}>
      <Button onClick={createNewRoom} disabled={isLoading}>
        Create room
      </Button>
    </main>
  )
}
