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
  query,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDisclosure } from '@mantine/hooks'
import { Button, Loader, Modal, TextInput } from '@mantine/core'
const dbInstance = collection(database, 'rooms')

interface IUser {
  id: string
  username: string
  estimate?: number
}

export default function Room({ params }: IRoomPageParams) {
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null)
  const [estimateId, setEstimateId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentUser, setCurrentUser] = useState<IUser | null>(null)
  const [users, setUsers] = useState<IUser[]>([])
  const [username, setUsername] = useState('')
  const [displayData, setDisplayData] = useState<boolean>(false)
  const [opened, { open, close }] = useDisclosure(false)

  const router = useRouter()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setUsername(event?.target?.value)

  const getNotes = async () => {
    const docRef = doc(database, 'rooms', params.id)

    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      console.error('No room with id: ', params.id)

      router.push(`/`)

      return
    }

    userChangeSnapshotListener()
    estimateChangeSnapshotListener()
    displayDataChangeListener()
  }

  const displayDataChangeListener = () => {
    const docRef = doc(database, 'rooms', params.id)

    const q = query(collection(docRef, 'display'))
    console.log({ q })
    onSnapshot(docRef, (querySnapshot) => {
      const data = querySnapshot.data()

      console.log('ovo change', data?.displayEstimates)
      setDisplayData(data?.displayEstimates)
    })
  }

  const userChangeSnapshotListener = () => {
    let collectionRef = collection(dbInstance, params.id, 'users')
    const cookie = getCookie('pokerestUserCookie')
    let cookieUser: IUser

    if (cookie) {
      cookieUser = JSON.parse(cookie)
    }

    onSnapshot(collectionRef, (querySnapshot) => {
      const newUsers: IUser[] = []
      console.log('onSnapshot')
      querySnapshot.forEach((doc) => {
        const userData = doc.data()
        console.log('User ID: ', doc.id, ' Users data: ', userData)
        newUsers.push({
          id: doc.id,
          username: userData.username,
          estimate: userData.estimate,
        })

        if (doc.id === cookieUser?.id) {
          console.log('nasao', { userData })
          setCurrentUser({
            id: doc.id,
            username: userData.username,
            estimate: userData.estimate,
          })
          // cookieUser = {
          //   id: doc.id,
          //   ...userData,
          // }
        }
      })

      if (newUsers.length <= 0) {
        open()
      }
      console.log({ newUsers })
      setUsers(newUsers)
    })
  }

  const estimateChangeSnapshotListener = () => {
    let collectionRef = collection(dbInstance, params.id, 'estimates')

    onSnapshot(collectionRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const docData = doc.data()
        console.log('Estimates data: ', docData, { users })
      })
    })
  }

  useEffect(() => {
    setIsLoading(true)
    const cookie = getCookie('pokerestUserCookie')
    if (!cookie) {
      open()
    } else {
      const cookieUser: IUser = JSON.parse(cookie)
      console.log(cookieUser.username)
      if (!cookieUser.username || !cookieUser.id) {
        open()
      } else {
        if (cookieUser.username && cookieUser.id) {
          joinRoom(cookieUser)
        }
        // TODO: user postoji u cookie, ali nije dodan u room na firebase
        setCurrentUser({ username: cookieUser.username, id: cookieUser.id })
        // getData(cookieUser.id)
      }
    }
    getNotes()
    setIsLoading(false)

    return () => {
      removeFromRoom(currentUser)
    }
  }, [])

  const joinRoom = async (cookieUser: IUser) => {
    const response = await setDoc(
      doc(database, 'rooms', params.id, 'users', cookieUser.id),
      {
        username: cookieUser.username,
      },
      { merge: true }
    )

    console.log('joinRoom', cookieUser.id, { response })
  }

  const removeFromRoom = async (cookieUser: IUser | null) => {
    if (!cookieUser?.id) {
      console.error('nema userId, removeFromRoom')
      return
    }

    await deleteDoc(doc(database, 'rooms', params.id, 'users', cookieUser.id))
  }

  const saveUser = async () => {
    let collectionRef = collection(dbInstance, params.id, 'users')

    const response = await addDoc(collectionRef, {
      username: username,
    })

    console.log({ response })

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
    close()
  }

  if (isLoading) {
    return <Loader speed="0.65s" color="blue" size="xl" />
  }

  const setEstimateOnUser = async (value: number) => {
    if (!currentUser?.id) {
      return console.error('no user id')
    }
    if (currentUser?.estimate) {
      console.log('ima estimate')
      const response = await setDoc(
        doc(database, 'rooms', params.id, 'users', currentUser.id),
        {
          estimate: null,
        },
        { merge: true }
      )

      console.log({ response })
    } else {
      const response = await setDoc(
        doc(database, 'rooms', params.id, 'users', currentUser.id),
        {
          estimate: value,
        },
        { merge: true }
      )

      console.log({ response })
    }
  }

  const getValues = async () => {
    console.log('test')
    let collectionRef = collection(dbInstance, params.id, 'estimates')
    // const docSnap = await getDoc(collectionRef)
    const querySnapshot = await getDocs(collectionRef)
    console.log({ querySnapshot })
    const data = querySnapshot.docs
    console.log({ data })
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, ' => ', doc.data())
    })
  }

  const displayEstimates = async () => {
    const roomsRef = doc(dbInstance, params.id)

    const res = await updateDoc(roomsRef, {
      displayEstimates: true,
    })

    console.log('displayEstimates', { res })
    // const cityRef = dbInstance.collection('cities').doc('DC');

    // Set the 'capital' field of the city
  }
  const hideEstimates = async () => {
    const roomsRef = doc(dbInstance, params.id)

    const res = await updateDoc(roomsRef, {
      displayEstimates: false,
    })

    console.log('displayEstimates', { res })
    // const cityRef = dbInstance.collection('cities').doc('DC');

    // Set the 'capital' field of the city
  }

  const resetEstimates = async () => {
    console.log('resetEstimates')

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
  }

  return (
    <div>
      <h1>
        You are: <b>{!!currentUser?.username ? currentUser?.username : '/'}</b>
      </h1>
      <div>
        <span>Other users in room:</span>
        {users.length > 0 &&
          users
            .filter((user) => user.id !== currentUser?.id)
            .map((user) => (
              <p key={user.id}>
                {user.username}
                {displayData && user?.estimate}
              </p>
            ))}
      </div>
      {/* {!!estimatedValue && <span>{estimatedValue}</span>} */}
      {currentUser?.estimate && <span>{currentUser?.estimate}</span>}

      <Button onClick={() => getValues()}>Get values</Button>
      <Button onClick={() => removeFromRoom(currentUser)}>
        Remove from room
      </Button>
      <Button onClick={displayEstimates}>Display estimates</Button>
      <Button onClick={hideEstimates}>Hide estimates</Button>
      <Button color="red" onClick={resetEstimates}>
        Reset estimates
      </Button>
      {displayData && <div>Pokazi svima</div>}
      <div>
        {[2, 4, 6, 8].map((estimateValue) => (
          <Button
            key={`estimate-Button-${estimateValue}`}
            onClick={() => setEstimateOnUser(estimateValue)}
            disabled={
              !!currentUser?.estimate && currentUser?.estimate !== estimateValue
            }
          >
            {estimateValue}
          </Button>
        ))}
      </div>
      <Modal title="Enter username" opened={opened} onClose={close} centered>
        <TextInput
          label="username"
          placeholder="username"
          value={username}
          onChange={handleChange}
        />

        <Button onClick={saveUser} mt={16}>
          Save
        </Button>
      </Modal>
    </div>
  )
}
