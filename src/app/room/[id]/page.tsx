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
  setDoc,
} from 'firebase/firestore'
import { ChangeEvent, useEffect, useState } from 'react'
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
  estimate?: number
}

export default function Room({ params }: IRoomPageParams) {
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null)
  const [estimateId, setEstimateId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentUser, setUser] = useState<IUser | null>(null)
  const [users, setUsers] = useState<IUser[]>([])
  const [userName, setUsername] = useState('')
  const [displayData, setDisplayData] = useState<boolean>(false)

  const { isOpen, onOpen, onClose } = useDisclosure()
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
    // const collectionRef = firebase.firestore().collection('myCollection');
    // let collectionRef = collection(dbInstance, params.id)
    const docRef = doc(database, 'rooms', params.id)

    // Create a query to listen for changes in the collection
    // const query = collectionRef.where('fieldName', '!=', null)

    //   docRef.on('value', (snapshot) => {
    //   const fieldValue = snapshot.val();
    //   console.log('Field Value Changed:', fieldValue);

    //   // Handle the changed value here, such as updating your component's state
    // });

    const q = query(collection(docRef, 'display'))
    console.log({ q })
    onSnapshot(docRef, (querySnapshot) => {
      // console.log({ querySnapshot })
      const data = querySnapshot.data()

      console.log(data?.display)
      setDisplayData(data?.display)
      // querySnapshot.forEach((doc) => {
      //   console.log('Users data: ', doc.data())
      //   // newUsers.push({ id: doc.id, userName: doc.data().userName })
      // })
      // console.log('Current cities in CA: ', cities.join(', '))
    })
    // const unsub = onSnapshot(
    //   doc(database, 'rooms', 'SF'),
    //   { includeMetadataChanges: true },
    //   (doc) => {
    //     // ...
    //   }
    // )

    // const unsubscribe = q.onSnapshot((querySnapshot) => {
    //   // Loop through the documents in the query result
    //   querySnapshot.forEach((doc) => {
    //     // Access the specific field 'fieldName' in each document
    //     const fieldData = doc.get('fieldName')

    //     // Update your component state with the field value
    //     setFieldValue(fieldData)
    //   })
    // })
  }

  const userChangeSnapshotListener = () => {
    let collectionRef = collection(dbInstance, params.id, 'users')

    onSnapshot(collectionRef, (querySnapshot) => {
      const newUsers: IUser[] = []
      console.log('onSnapshot')
      querySnapshot.forEach((doc) => {
        const userData = doc.data()
        console.log('Users data: ', doc.data(), userData)
        newUsers.push({ id: doc.id, userName: userData.userName })
      })

      if (newUsers.length <= 0) {
        onOpen()
      }
      console.log({ newUsers })
      setUsers([...newUsers])
    })
  }

  const estimateChangeSnapshotListener = () => {
    let collectionRef = collection(dbInstance, params.id, 'estimates')

    onSnapshot(collectionRef, (querySnapshot) => {
      const usersData = [...users]
      querySnapshot.forEach((doc) => {
        const docData = doc.data()
        console.log('Estimates data: ', docData)
        console.log({ usersData })

        const newData = usersData.map((userData) => {
          if (docData.userId === userData.id) {
            console.log('dadada')

            return {
              ...userData,
              estimate: docData.estimate,
            }
          }

          return userData
        })

        console.log({ newData })
        // usersData.find()
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
        if (cookieUser.id && cookieUser.id) {
          joinRoom(cookieUser)
          // saveUser(cookieUser.id)
        }
        // TODO: user postoji u cookie, ali nije dodan u room na firebase
        setUser({ userName: cookieUser.userName, id: cookieUser.id })
        getData(cookieUser.id)
      }
    }
    getNotes()
    setIsLoading(false)

    return () => {
      removeFromRoom(currentUser)
    }
  }, [])

  const joinRoom = async (cookieUser: IUser) => {
    // let collectionRef = collection(dbInstance, params.id, 'users')
    // await setDoc(doc(db, "cities", "new-city-id"), data);

    const response = await setDoc(
      doc(database, 'rooms', params.id, 'users', cookieUser.id),
      {
        userName: cookieUser.userName,
      }
    )
    // const response = await setDoc(collectionRef, {
    //   userName: cookieUser.userName,
    //   id: cookieUser.id,
    // })

    console.log('joinRoom', cookieUser.id, { response })
  }

  const removeFromRoom = async (cookieUser: IUser | null) => {
    if (!cookieUser?.id) {
      console.error('nema userId, removeFromRoom')
      return
    }

    await deleteDoc(doc(database, 'rooms', params.id, 'users', cookieUser.id))
  }

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

  return (
    <div>
      <h1>
        You are: <b>{!!currentUser?.userName ? currentUser?.userName : '/'}</b>
      </h1>
      <div>
        <span>Other users in room:</span>
        {users.length > 0 &&
          users
            .filter((user) => user.id !== currentUser?.id)
            .map((user) => <p key={user.id}>{user.userName}</p>)}
      </div>
      {!!estimatedValue && <span>{estimatedValue}</span>}

      <Button onClick={() => getValues()} colorScheme="blue">
        Get values
      </Button>
      <Button onClick={() => removeFromRoom(currentUser)} colorScheme="blue">
        Remove from room
      </Button>
      {displayData && <div>Pokazi svima</div>}
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
            <Button onClick={() => saveUser()} colorScheme="blue" mr={3}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
