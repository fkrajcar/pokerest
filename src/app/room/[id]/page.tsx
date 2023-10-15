'use client'

import { getCookie, setCookie } from 'cookies-next'

export interface IRoomPageParams {
  params: IRoomParams
}

export interface IRoomParams {
  id: string
}
import { database } from '@/firebase/config'
import {
  collection,
  getDoc,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { useDisclosure } from '@mantine/hooks'
import {
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Modal,
  TextInput,
} from '@mantine/core'
import { PokerCard } from '@/app/components/PokerCard/PokerCard'
import { UserCard } from '@/app/components/UserCard/UserCard'
import { EstimateCard } from '@/app/components/EstimateCard/EstimateCard'
const dbInstance = collection(database, 'rooms')

export interface IUser {
  id: string
  username: string
  estimate?: number
}

export default function Room({ params }: IRoomPageParams) {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentUser, setCurrentUser] = useState<IUser | null>(null)
  const [users, setUsers] = useState<IUser[]>([])
  const [username, setUsername] = useState('')
  const [displayData, setDisplayData] = useState<boolean>(false)
  const [opened, { open, close }] = useDisclosure(false)

  const router = useRouter()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setUsername(event?.target?.value)

  const checkRoom = async () => {
    const docRef = doc(database, 'rooms', params.id)

    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      console.error('No room with id: ', params.id)

      router.push(`/`)

      return
    }
  }

  const initListeners = () => {
    userChangeSnapshotListener()
    displayDataChangeListener()
  }

  const displayDataChangeListener = () => {
    const docRef = doc(database, 'rooms', params.id)

    onSnapshot(docRef, (querySnapshot) => {
      const data = querySnapshot.data()

      setDisplayData(data?.displayEstimates)
    })
  }

  const userChangeSnapshotListener = useCallback(() => {
    let collectionRef = collection(dbInstance, params.id, 'users')
    const cookie = getCookie('pokerestUserCookie')
    let cookieUser: IUser

    if (cookie) {
      cookieUser = JSON.parse(cookie)
    }

    onSnapshot(collectionRef, (querySnapshot) => {
      const newUsers: IUser[] = []
      querySnapshot.forEach((doc) => {
        const userData = doc.data()
        newUsers.push({
          id: doc.id,
          username: userData.username,
          estimate: userData.estimate,
        })

        if (doc.id === cookieUser?.id || currentUser?.id === doc.id) {
          setCurrentUser({
            id: doc.id,
            username: userData.username,
            estimate: userData.estimate,
          })
        }
      })

      if (newUsers.length <= 0) {
        open()
      }
      setUsers(newUsers)
    })
  }, [currentUser, open, params.id])

  const joinRoom = useCallback(
    async (cookieUser: IUser) => {
      await setDoc(
        doc(database, 'rooms', params.id, 'users', cookieUser.id),
        {
          username: cookieUser.username,
        },
        { merge: true }
      )
      initListeners()
    },
    [params]
  )

  const removeFromRoom = useCallback(
    async (cookieUser: IUser | null) => {
      if (!cookieUser?.id) {
        return console.error('userId is not set!')
      }

      await deleteDoc(doc(database, 'rooms', params.id, 'users', cookieUser.id))
    },
    [params?.id]
  )

  useEffect(() => {
    setIsLoading(true)

    checkRoom()

    const cookie = getCookie('pokerestUserCookie')

    if (!cookie) {
      open()
    } else {
      const cookieUser: IUser = JSON.parse(cookie)
      if (!cookieUser.username || !cookieUser.id) {
        open()
      } else {
        setCurrentUser({ username: cookieUser.username, id: cookieUser.id })

        if (cookieUser.username && cookieUser.id) {
          joinRoom(cookieUser)
        }
      }
    }
    setIsLoading(false)

    return () => {
      removeFromRoom(currentUser)
    }
  }, [])

  const saveUser = async () => {
    let collectionRef = collection(dbInstance, params.id, 'users')

    const response = await addDoc(collectionRef, {
      username: username,
    })

    setCookie(
      'pokerestUserCookie',
      JSON.stringify({
        username: username,
        id: response.id,
      })
    )

    setCurrentUser({
      username: username,
      id: response.id,
    })
    initListeners()

    close()
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

  const setEstimateOnUser = async (value: number) => {
    if (!currentUser?.id) {
      return console.error('userId is not set!')
    }

    if (currentUser?.estimate) {
      await setDoc(
        doc(database, 'rooms', params.id, 'users', currentUser.id),
        {
          estimate: null,
        },
        { merge: true }
      )
    } else {
      await setDoc(
        doc(database, 'rooms', params.id, 'users', currentUser.id),
        {
          estimate: value,
        },
        { merge: true }
      )
    }
  }

  const setDisplayEstimates = async (display: boolean) => {
    const roomsRef = doc(dbInstance, params.id)

    await updateDoc(roomsRef, {
      displayEstimates: display,
    })

    getAverage()
  }

  const resetEstimates = async () => {
    let collectionRef = collection(dbInstance, params.id, 'users')
    const querySnapshot = await getDocs(collectionRef)
    await Promise.all(
      querySnapshot.docs.map((document) => {
        return setDoc(
          doc(database, 'rooms', params.id, 'users', document.id),
          {
            estimate: null,
          },
          { merge: true }
        )
      })
    )

    await setDisplayEstimates(false)
  }

  const getAverage = () => {
    const estimates = users
      .map((user) => user.estimate)
      .filter((estimate) => !!estimate)

    var sum = estimates.reduce((accumulator, currentValue) => {
      if (accumulator === undefined || currentValue === undefined) {
        return 0
      }

      return accumulator + currentValue
    }, 0)

    if (!sum) {
      return 0
    }

    const avg = sum / estimates?.length

    return avg
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      saveUser()
    }
  }

  return (
    <Container py="md">
      <Group gap={8}>
        {[1, 2, 3, 4, 5, 6, 8, 12, 14, 16, 20, 24].map((estimateValue) => (
          <PokerCard
            value={estimateValue}
            key={estimateValue}
            selectedEstimate={currentUser?.estimate}
            setEstimateOnUser={setEstimateOnUser}
            disableAction={displayData}
          />
        ))}
      </Group>
      <Group gap={8} mt={64}>
        {users.length > 0 &&
          users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              displayEstimate={displayData}
              removeFromRoom={removeFromRoom}
            />
          ))}
      </Group>

      <Box mt={64}>
        <EstimateCard value={getAverage()} displayData={displayData} />
      </Box>

      <Group gap={8} mt={32}>
        <Button color="red" onClick={resetEstimates}>
          Reset estimates
        </Button>

        <Button onClick={() => setDisplayEstimates(!displayData)}>
          {displayData ? 'Hide estimates' : 'Display estimates'}
        </Button>
      </Group>

      <Modal title="Enter username" opened={opened} onClose={close} centered>
        <TextInput
          label="username"
          placeholder="username"
          value={username}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        <Button disabled={!username} onClick={saveUser} mt={16}>
          Save
        </Button>
      </Modal>
    </Container>
  )
}
