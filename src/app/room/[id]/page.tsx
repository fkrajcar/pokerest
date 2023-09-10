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
  where,
  getDocs,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
const dbInstance = collection(database, 'rooms')

interface IUser {
  id: string
  userName: string
}

export default function Room({ params }: IRoomPageParams) {
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null)
  const [estimateId, setEstimateId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentUser, setUser] = useState<IUser | null>(null)
  const [users, setUsers] = useState<IUser[]>([])
  const [userName, setUsername] = useState('')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()

  const handleChange = (event) => setUsername(event.target.value)

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
  }

  const userChangeSnapshotListener = () => {
    let collectionRef = collection(dbInstance, params.id, 'users')

    onSnapshot(collectionRef, (querySnapshot) => {
      const newUsers: IUser[] = []

      querySnapshot.forEach((doc) => {
        console.log('Users data: ', doc.data())
        newUsers.push({ id: doc.id, userName: doc.data().userName })
      })

      if (newUsers.length <= 0) {
        onOpen()
      }

      setUsers(newUsers)
    })
  }

  const estimateChangeSnapshotListener = () => {
    let collectionRef = collection(dbInstance, params.id, 'estimates')

    onSnapshot(collectionRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log('Estimates data: ', doc.data())
      })
    })
  }

  useEffect(() => {
    setIsLoading(true)
    const cookie = getCookie('pokerestUserCookie')
    if (!cookie) {
      onOpen()
    } else {
      const cookieUser: IUser = JSON.parse(cookie)
      console.log(cookieUser.userName)
      if (!cookieUser.userName || !cookieUser.id) {
        onOpen()
      } else {
        // TODO: user postoji u cookie, ali nije dodan u room na firebase
        setUser({ userName: cookieUser.userName, id: cookieUser.id })
        getData(cookieUser.id)
      }
    }
    getNotes()
    setIsLoading(false)
  }, [])

  const getData = async (userId: string) => {
    const q = query(
      collection(dbInstance, params.id, 'estimates'),
      where('userId', '==', userId)
    )

    const querySnapshot = await getDocs(q)

    querySnapshot.forEach((doc) => {
      setEstimatedValue(doc.data().estimate)
      setEstimateId(doc.id)
    })
  }

  const saveUser = async () => {
    let collectionRef = collection(dbInstance, params.id, 'users')

    const response = await addDoc(collectionRef, {
      userName: userName,
    })

    console.log({ response })

    setCookie(
      'pokerestUserCookie',
      JSON.stringify({
        userName: userName,
        id: response.id,
      })
    )

    setUser({
      userName: userName,
      id: response.id,
    })
    onClose()
  }

  if (isLoading) {
    return (
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    )
  }

  const setEstimateValue = async (value: number) => {
    console.log(value)

    let collectionRef = collection(dbInstance, params.id, 'estimates')

    if (estimatedValue && estimateId) {
      const response = await deleteDoc(
        doc(dbInstance, params.id, 'estimates', estimateId)
      )
      console.log('delete:', { response })
      return setEstimatedValue(null)
    }

    if (currentUser?.id) {
      const response = await addDoc(collectionRef, {
        estimate: value,
        userId: currentUser.id,
      })
      console.log({ response })
      setEstimatedValue(value)
      setEstimateId(response.id)
    } else {
      console.error('error')
    }
  }

  return (
    <div>
      <h1>
        Current user:{' '}
        <b>{!!currentUser?.userName ? currentUser?.userName : 'nema'}</b>
      </h1>
      <div>
        <span>Other users in room:</span>
        {users.length > 0 &&
          users
            .filter((user) => user.id !== currentUser?.id)
            .map((user) => <p key={user.id}>{user.userName}</p>)}
      </div>
      {!!estimatedValue && <span>{estimatedValue}</span>}
      <div>
        {[2, 4, 6, 8].map((estimateValue) => (
          <Button
            key={`estimate-button-${estimateValue}`}
            onClick={() => setEstimateValue(estimateValue)}
            colorScheme="blue"
            isDisabled={!!estimatedValue && estimatedValue !== estimateValue}
          >
            {estimateValue}
          </Button>
        ))}
      </div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create your account</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                value={userName}
                onChange={handleChange}
                placeholder="Name"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={saveUser} colorScheme="blue" mr={3}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
