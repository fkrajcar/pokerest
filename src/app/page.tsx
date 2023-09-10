'use client'

import { addDoc, collection } from 'firebase/firestore'
import styles from './page.module.css'
import { database } from '../firebase/config'
import { useRouter } from 'next/navigation'
import { getCookie, setCookie } from 'cookies-next'
import { useEffect } from 'react'

const dbInstance = collection(database, 'rooms')

export default function Home() {
  const router = useRouter()

  const saveRoom = () => {
    return addDoc(dbInstance, {})
  }

  useEffect(() => {
    const cookie = getCookie('zix')

    if (!cookie) {
      console.log('nema')
      // ovdje trazi da user postavi cookie i stvori userId
    }
    return () => {}
  }, [])

  const createNewRoom = async () => {
    try {
      await setCookie('zix', { name: 'zix', userId: 'sadasda' })

      console.log('createNewRoom')
      const response = await saveRoom()
      console.log('res', response.id)
      if (response.id) {
        router.push(`/room/${response.id}`)
      }
    } catch (e) {
      console.error(e)
    }
  }
  const getRoom = async (id: string) => {
    console.log('getRoom')
    fetch(`/api/room/${id}`)
      .then((res) => {
        console.log('component', res)
      })
      .catch((error) => {
        console.error(error)
      })
  }
  return (
    <main className={styles.main}>
      <button onClick={createNewRoom}>Create new room</button>
    </main>
  )
}
