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
  setDoc,
  deleteDoc,
} from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
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
  const [user, setUser] = useState<IUser | null>(null)
  const [users, setUsers] = useState<IUser[]>([])
  const [value, setValue] = useState('')
  const handleChange = (event) => setValue(event.target.value)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()

  // const data = await getData()
  const getNotes = async () => {
    console.log(params.id)

    const docRef = doc(database, 'rooms', params.id)
    const docSnap = await getDoc(docRef)
    onSnapshot(docRef, (querySnapshot) => {
      console.log(querySnapshot.data())
    })
    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data())
    } else {
      // docSnap.data() will be undefined in this case
      console.log('No such document!')
      router.push(`/`)
    }

    // getDocs(dbInstance).then((data) => {
    //   const readableData = data.docs.map((item) => {
    //     return { ...item.data(), id: item.id }
    //   })
    //   console.log(readableData)
    // })

    let collectionRef = collection(dbInstance, params.id, 'users')

    onSnapshot(collectionRef, (querySnapshot) => {
      const newUsers: IUser[] = []
      querySnapshot.forEach((doc) => {
        console.log('Id: ', doc.id, 'Data: ', doc.data())

        newUsers.push({ id: doc.id, userName: doc.data().userName })
      })
      if (newUsers.length <= 0) {
        onOpen()
      }
      console.log(newUsers)
      setUsers(newUsers)
    })
  }

  useEffect(() => {
    setIsLoading(true)
    const cookie = getCookie('pokerestUserCookie')
    if (!cookie) {
      onOpen()
    } else {
      const jsonParse: IUser = JSON.parse(cookie)
      console.log(jsonParse.userName)
      if (!jsonParse.userName || !jsonParse.id) {
        onOpen()
      } else {
        setUser({ userName: jsonParse.userName, id: jsonParse.id })
      }
      // setUser(cookie)
    }

    getNotes()

    setIsLoading(false)
  }, [])

  // const createNewUser = async () => {
  //   console.log('createNewUser')
  //   // const docRef = doc(database, 'rooms', params.id, 'estimates')

  //   // collectionRef.

  //   const response = await setDoc(
  //     doc(database, 'rooms', `${params.id}/estimates/new`),
  //     {
  //       test: 'eee',
  //     },
  //     { merge: true }
  //   )
  //   // (docRef, {
  //   //   name: 'Los Angeles',
  //   //   state: 'CA',
  //   //   country: 'USA',
  //   // })

  //   console.log({ response })
  // }

  const deleteEstimate = async () => {
    await deleteDoc(doc(database, 'rooms', `${params.id}/estimates/new`))
  }

  const createUser = async () => {
    let collectionRef = collection(dbInstance, params.id, 'users')

    const response = await addDoc(collectionRef, {
      userName: value,
    })

    console.log({ response })

    setCookie(
      'pokerestUserCookie',
      JSON.stringify({
        userName: value,
        id: response.id,
      })
    )

    setUser({
      userName: value,
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

    if (user?.id) {
      const response = await addDoc(collectionRef, {
        estimate: value,
        userId: user.id,
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
      <h1>{!!user?.userName ? user?.userName : 'nema'}</h1>
      <div>
        <span>Mapirani useri:</span>
        {users.length > 0 &&
          users.map((user) => <p key={user.id}>{user.userName}</p>)}
      </div>
      {/* <Button onClick={createNewUser} colorScheme="blue">
        Create user
      </Button> */}
      <Button onClick={deleteEstimate} colorScheme="blue">
        Delete user
      </Button>
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
              <Input value={value} onChange={handleChange} placeholder="Name" />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={createUser} colorScheme="blue" mr={3}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
