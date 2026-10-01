import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Coffee,
  Leaf,
  Images,
  MapPin,
  Waves,
  ShoppingBag,
  Snowflake,
  ShieldCheck,
  Sofa,
  Trash2,
  UsersRound,
  Wifi,
  X,
} from 'lucide-react'
import './App.css'

type Room = {
  id: number
  name: string
  description: string
  pricePerNight: number
  capacity: number
  imageUrl: string
  imageUrls: string[]
  hasWifi: boolean
  hasAirConditioning: boolean
  hasDedicatedLivingRoom: boolean
}

type Booking = {
  id: string
  roomName: string
  guestName: string
  guestEmail: string
  guests: number
  checkIn: string
  checkOut: string
  totalPrice: number
  roomSubtotal: number
  extrasTotal: number
  breakfastTotal: number
  airportPickupPrice: number
  airportDropoffPrice: number
  includesBreakfast: boolean
  airportPickup: boolean
  airportDropoff: boolean
  hasWifi: boolean
  hasAirConditioning: boolean
  hasDedicatedLivingRoom: boolean
  status: string
  paymentStatus: string
}

type CreatedBooking = {
  bookingId: string
  bookingToken: string
  status: string
  roomSubtotal: number
  extrasTotal: number
  totalPrice: number
  nights: number
}

type BookingOptions = {
  breakfastPerGuestPerNight: number
  airportPickup: number
  airportDropoff: number
}

type StoredStayCart = {
  room: Room | null
  breakfast: boolean
  airportPickup: boolean
  airportDropoff: boolean
}

const defaultBookingOptions: BookingOptions = {
  breakfastPerGuestPerNight: 180,
  airportPickup: 650,
  airportDropoff: 650,
}

function photoGallery(...photoIds: string[]) {
  return photoIds.map((photoId) =>
    `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1400&q=85`,
  )
}

const sampleRooms: Room[] = [
  {
    id: 1,
    name: 'The Garden Suite',
    description: 'A quiet ground-floor suite opening onto the walled garden.',
    pricePerNight: 189,
    capacity: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85',
    imageUrls: photoGallery('photo-1611892440504-42a792e24d32', 'photo-1616594039964-ae9021a400a0', 'photo-1616486338812-3dadae4b4ace', 'photo-1618221195710-dd6b41faaea6', 'photo-1615874959474-d609969a20ed'),
    hasWifi: true,
    hasAirConditioning: true,
    hasDedicatedLivingRoom: true,
  },
  {
    id: 2,
    name: 'The Orchard Room',
    description: 'A sunlit king room with a window seat and orchard views.',
    pricePerNight: 225,
    capacity: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=85',
    imageUrls: photoGallery('photo-1616594039964-ae9021a400a0', 'photo-1618220179428-22790b461013', 'photo-1617104678098-de229db51175', 'photo-1631049307264-da0ec9d70304', 'photo-1611892440504-42a792e24d32'),
    hasWifi: true,
    hasAirConditioning: true,
    hasDedicatedLivingRoom: false,
  },
  {
    id: 3,
    name: 'The Loft',
    description: 'A generous attic hideaway with space for a small family.',
    pricePerNight: 268,
    capacity: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85',
    imageUrls: photoGallery('photo-1616486338812-3dadae4b4ace', 'photo-1618221195710-dd6b41faaea6', 'photo-1615874959474-d609969a20ed', 'photo-1566665797739-1674de7a421a', 'photo-1616594039964-ae9021a400a0'),
    hasWifi: true,
    hasAirConditioning: false,
    hasDedicatedLivingRoom: true,
  },
  {
    id: 4,
    name: 'The Rose Cottage Room',
    description: 'A bright king room with a vintage writing desk and rose-garden outlook.',
    pricePerNight: 205,
    capacity: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=85',
    imageUrls: photoGallery('photo-1615874959474-d609969a20ed', 'photo-1618220179428-22790b461013', 'photo-1618221195710-dd6b41faaea6', 'photo-1582719478250-c89cae4dc85b', 'photo-1611892440504-42a792e24d32'),
    hasWifi: true,
    hasAirConditioning: true,
    hasDedicatedLivingRoom: false,
  },
  {
    id: 5,
    name: 'The Stable Suite',
    description: 'A characterful former stable with exposed beams and a private patio.',
    pricePerNight: 230,
    capacity: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1200&q=85',
    imageUrls: photoGallery('photo-1617104678098-de229db51175', 'photo-1616486338812-3dadae4b4ace', 'photo-1564013799919-ab600027ffc6', 'photo-1618220179428-22790b461013', 'photo-1631049307264-da0ec9d70304'),
    hasWifi: true,
    hasAirConditioning: false,
    hasDedicatedLivingRoom: true,
  },
  {
    id: 6,
    name: 'The Meadow Twin',
    description: 'Two comfortable beds and open views across the meadow.',
    pricePerNight: 215,
    capacity: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=85',
    imageUrls: photoGallery('photo-1631049307264-da0ec9d70304', 'photo-1631049035182-249067d7618e', 'photo-1616594039964-ae9021a400a0', 'photo-1578683010236-d716f9a3f461', 'photo-1615874959474-d609969a20ed'),
    hasWifi: true,
    hasAirConditioning: true,
    hasDedicatedLivingRoom: false,
  },
  {
    id: 7,
    name: 'The Coach House',
    description: 'A private entrance, king bedroom, and a separate sitting room.',
    pricePerNight: 295,
    capacity: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
    imageUrls: photoGallery('photo-1618221195710-dd6b41faaea6', 'photo-1618220179428-22790b461013', 'photo-1616486029423-aaa4789e8c9a', 'photo-1582719478250-c89cae4dc85b', 'photo-1611892440504-42a792e24d32'),
    hasWifi: true,
    hasAirConditioning: true,
    hasDedicatedLivingRoom: true,
  },
  {
    id: 8,
    name: 'The Bluebell Room',
    description: 'A restful queen room with soft morning light and a terrace nearby.',
    pricePerNight: 205,
    capacity: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1631049035182-249067d7618e?auto=format&fit=crop&w=1200&q=85',
    imageUrls: photoGallery('photo-1631049035182-249067d7618e', 'photo-1578683010236-d716f9a3f461', 'photo-1616594039964-ae9021a400a0', 'photo-1618221195710-dd6b41faaea6', 'photo-1566665797739-1674de7a421a'),
    hasWifi: true,
    hasAirConditioning: false,
    hasDedicatedLivingRoom: false,
  },
  {
    id: 9,
    name: 'The Family Garden Suite',
    description: 'Two sleeping areas and a generous lounge for an easy family stay.',
    pricePerNight: 335,
    capacity: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
    imageUrls: photoGallery('photo-1590490360182-c33d57733427', 'photo-1564013799919-ab600027ffc6', 'photo-1616486338812-3dadae4b4ace', 'photo-1582719478250-c89cae4dc85b', 'photo-1618220179428-22790b461013'),
    hasWifi: true,
    hasAirConditioning: true,
    hasDedicatedLivingRoom: true,
  },
]

const propertyScenes = [
  {
    id: 'interiors',
    label: 'The interiors',
    title: 'Spaces made for staying in.',
    description: 'Soft linens, considered details, and rooms that make an ordinary evening feel like part of the holiday.',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=90',
    imageAlt: 'Warm, carefully styled country house living room',
    note: 'A little slower, by design',
    icon: BedDouble,
  },
  {
    id: 'grounds',
    label: 'The views',
    title: 'The countryside, just outside.',
    description: 'Follow the garden paths into open green views, quiet corners, and the sort of fresh air that changes your plans.',
    imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1800&q=90',
    imageAlt: 'Open rolling countryside in soft afternoon light',
    note: 'Room to take the long way',
    icon: Leaf,
  },
  {
    id: 'pool',
    label: 'Poolside',
    title: 'A more polished kind of pause.',
    description: 'Take a dip, stretch out in the sun, and let the afternoon take care of itself beside the house pool.',
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1800&q=90',
    imageAlt: 'A sophisticated outdoor pool framed by greenery',
    note: 'The afternoon can wait',
    icon: Waves,
  },
]

const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''
const currentMonthName = new Intl.DateTimeFormat('en-ZA', { month: 'long' }).format(new Date())

function localDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateAfter(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return localDate(date)
}

function dayAfter(value: string) {
  const date = new Date(`${value}T00:00:00`)
  date.setDate(date.getDate() + 1)
  return localDate(date)
}

function nightsBetween(checkIn: string, checkOut: string) {
  return Math.max(
    1,
    Math.round((new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) / 86400000),
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(value)
}

function readStoredStayCart(): StoredStayCart {
  const emptyCart = { room: null, breakfast: false, airportPickup: false, airportDropoff: false }
  try {
    const saved = sessionStorage.getItem('hearth-house-cart')
    if (!saved) return emptyCart
    const cart = JSON.parse(saved) as Partial<StoredStayCart>
    return {
      room: cart.room && typeof cart.room.id === 'number' && Array.isArray(cart.room.imageUrls) ? cart.room : null,
      breakfast: Boolean(cart.breakfast),
      airportPickup: Boolean(cart.airportPickup),
      airportDropoff: Boolean(cart.airportDropoff),
    }
  } catch {
    sessionStorage.removeItem('hearth-house-cart')
    return emptyCart
  }
}

function App() {
  const [rooms, setRooms] = useState<Room[]>(sampleRooms)
  const [activeSceneId, setActiveSceneId] = useState(propertyScenes[2].id)
  const [bookingOptions, setBookingOptions] = useState(defaultBookingOptions)
  const [apiOnline, setApiOnline] = useState(false)
  const [checkIn, setCheckIn] = useState(dateAfter(7))
  const [checkOut, setCheckOut] = useState(dateAfter(9))
  const [guests, setGuests] = useState(2)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [galleryRoom, setGalleryRoom] = useState<Room | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [booking, setBooking] = useState<CreatedBooking | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [addBreakfast, setAddBreakfast] = useState(false)
  const [airportPickup, setAirportPickup] = useState(false)
  const [airportDropoff, setAirportDropoff] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [lookupOpen, setLookupOpen] = useState(false)
  const [lookupId, setLookupId] = useState('')
  const [lookupToken, setLookupToken] = useState('')
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null)
  const [lookupMessage, setLookupMessage] = useState('')
  const [cart, setCart] = useState<StoredStayCart>(readStoredStayCart)
  const cartRoom = cart.room
  const cartBreakfast = cart.breakfast
  const cartAirportPickup = cart.airportPickup
  const cartAirportDropoff = cart.airportDropoff
  const [cartOpen, setCartOpen] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const activeScene = propertyScenes.find((scene) => scene.id === activeSceneId) ?? propertyScenes[0]
  const stayNights = nightsBetween(checkIn, checkOut)
  const visibleRooms = rooms.filter((room) => guests <= room.capacity)
  const roomSubtotal = selectedRoom ? selectedRoom.pricePerNight * stayNights : 0
  const breakfastTotal = addBreakfast
    ? bookingOptions.breakfastPerGuestPerNight * guests * stayNights
    : 0
  const pickupTotal = airportPickup ? bookingOptions.airportPickup : 0
  const dropoffTotal = airportDropoff ? bookingOptions.airportDropoff : 0
  const extrasTotal = breakfastTotal + pickupTotal + dropoffTotal
  const cartRoomSubtotal = cartRoom ? cartRoom.pricePerNight * stayNights : 0
  const cartBreakfastTotal = cartBreakfast ? bookingOptions.breakfastPerGuestPerNight * guests * stayNights : 0
  const cartPickupTotal = cartAirportPickup ? bookingOptions.airportPickup : 0
  const cartDropoffTotal = cartAirportDropoff ? bookingOptions.airportDropoff : 0
  const cartTotal = cartRoomSubtotal + cartBreakfastTotal + cartPickupTotal + cartDropoffTotal
  const cartItemCount = Number(Boolean(cartRoom)) + Number(cartBreakfast) + Number(cartAirportPickup) + Number(cartAirportDropoff)

  useEffect(() => {
    if (!cart.room) {
      sessionStorage.removeItem('hearth-house-cart')
      return
    }
    sessionStorage.setItem('hearth-house-cart', JSON.stringify(cart))
  }, [cart])

  function updateCart(update: Partial<StoredStayCart>) {
    setCart((current) => ({ ...current, ...update }))
  }

  function addRoomToCart(room: Room) {
    if (cartRoom && cartRoom.id !== room.id) {
      setCartMessage('Your cart already has a different room. Remove it before adding another stay.');
      setCartOpen(true);
      return;
    }
    if (!cartRoom) {
      updateCart({ room, breakfast: false, airportPickup: false, airportDropoff: false })
    }
    setCartMessage('');
    setCartOpen(true);
  }

  function addOfferToCart(roomId: number, extra: 'breakfast' | 'transfers' | 'none') {
    const room = rooms.find((item) => item.id === roomId)
    if (!room) return
    if (cartRoom && cartRoom.id !== room.id) {
      setCartMessage('Your cart already has a different room. Remove it before adding this offer.');
      setCartOpen(true);
      return;
    }
    updateCart({
      room: cartRoom ?? room,
      breakfast: extra === 'breakfast' || cartBreakfast,
      airportPickup: extra === 'transfers' || cartAirportPickup,
      airportDropoff: extra === 'transfers' || cartAirportDropoff,
    })
    setCartMessage('')
    setCartOpen(true)
  }

  function continueToBooking() {
    if (!cartRoom) return
    setSelectedRoom(cartRoom)
    setAddBreakfast(cartBreakfast)
    setAirportPickup(cartAirportPickup)
    setAirportDropoff(cartAirportDropoff)
    setBooking(null)
    setMessage('')
    setCartOpen(false)
  }

  useEffect(() => {
    const imageCount = galleryRoom?.imageUrls.length ?? 0
    if (!imageCount) return
    function handleGalleryKeys(event: KeyboardEvent) {
      if (event.key === 'Escape') setGalleryRoom(null)
      if (event.key === 'ArrowRight') setGalleryIndex((index) => (index + 1) % imageCount)
      if (event.key === 'ArrowLeft') setGalleryIndex((index) => (index - 1 + imageCount) % imageCount)
    }
    window.addEventListener('keydown', handleGalleryKeys)
    return () => window.removeEventListener('keydown', handleGalleryKeys)
  }, [galleryRoom?.imageUrls.length])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${apiBase}/api/rooms?checkIn=${checkIn}&checkOut=${checkOut}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Room service is unavailable.')
        return (await response.json()) as Room[]
      })
      .then((data) => {
        setRooms(data)
        setApiOnline(true)
      })
      .catch(() => {
        if (!controller.signal.aborted) setApiOnline(false)
      })
    return () => controller.abort()
  }, [checkIn, checkOut])

  useEffect(() => {
    fetch(`${apiBase}/api/booking-options`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Add-on pricing is unavailable.')
        return (await response.json()) as BookingOptions
      })
      .then(setBookingOptions)
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const match = window.location.pathname.match(/^\/booking\/([0-9a-f-]+)$/i)
    if (!match) return
    const token = sessionStorage.getItem(`booking:${match[1]}`)
    if (!token) return
    fetch(`${apiBase}/api/bookings/${match[1]}`, { headers: { 'X-Booking-Token': token } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Booking | null) => {
        if (data) {
          setFoundBooking(data)
          setLookupId(data.id)
          setLookupToken(token)
          setLookupOpen(true)
        }
      })
      .catch(() => undefined)
  }, [])

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedRoom) return
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(`${apiBase}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          guestName,
          guestEmail,
          guests,
          checkIn,
          checkOut,
          addBreakfast,
          airportPickup,
          airportDropoff,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'We could not create that booking.')

      const created = result as CreatedBooking
      sessionStorage.setItem(`booking:${created.bookingId}`, created.bookingToken)
      setBooking(created)
      updateCart({ room: null, breakfast: false, airportPickup: false, airportDropoff: false })

      const checkoutResponse = await fetch(`${apiBase}/api/bookings/${created.bookingId}/checkout`, {
        method: 'POST',
        headers: { 'X-Booking-Token': created.bookingToken },
      })
      const checkout = await checkoutResponse.json()
      if (checkoutResponse.ok && checkout.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl as string)
        return
      }
      setMessage(checkout.error ?? 'Your stay is held for 30 minutes. Online checkout is not configured yet.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function findBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLookupMessage('')
    setFoundBooking(null)
    try {
      const response = await fetch(`${apiBase}/api/bookings/${lookupId.trim()}`, {
        headers: { 'X-Booking-Token': lookupToken.trim() },
      })
      if (!response.ok) throw new Error('We could not find that booking. Check the ID and private access token.')
      setFoundBooking((await response.json()) as Booking)
    } catch (error) {
      setLookupMessage(error instanceof Error ? error.message : 'Booking details are unavailable.')
    }
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Hearth House home">
          <span className="brand-mark"><BedDouble size={19} strokeWidth={1.8} /></span>
          <span>hearth<span className="brand-light">house</span></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-active" href="#rooms">The rooms</a>
          <a href="#welcome">The property</a>
          <a href="#offers">Month-end offers</a>
        </nav>
        <button className="text-action" type="button" onClick={() => { setLookupOpen(true); setFoundBooking(null); setLookupMessage('') }}>
          Your booking <ArrowRight size={15} />
        </button>
        <button className="cart-action" type="button" aria-label={`Open cart, ${cartItemCount} items`} onClick={() => { setCartMessage(''); setCartOpen(true) }}>
          <ShoppingBag size={17} /><span>Cart</span><b>{cartItemCount}</b>
        </button>
      </header>

      <section className="hero" id="top">
        <img
          className="hero-image"
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=90"
          alt="A refined country house set in leafy grounds"
        />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> A HOUSE WITH ROOM TO BREATHE</p>
          <h1>Find your<br /><em>kind of quiet.</em></h1>
          <p className="hero-intro">Beautiful rooms, open countryside, and a pool made for doing nothing in particular.</p>
          <a className="hero-link" href="#welcome">Explore the property <ArrowRight size={16} /></a>
        </div>
        <div className="hero-caption"><MapPin size={14} /> Cotswolds, England <span>·</span> Est. 1894</div>
        <div className="hero-index">01 <span>/</span> 03</div>
      </section>

      <section className="search-strip" aria-label="Plan your stay">
        <div className="search-heading"><span>MAKE YOURSELF AT HOME</span><strong>Find your stay</strong></div>
          <label className="search-field">
          <CalendarDays size={17} />
          <span><small>CHECK IN</small><input type="date" value={checkIn} min={dateAfter(0)} onChange={(event) => { const nextCheckIn = event.target.value; setCheckIn(nextCheckIn); if (checkOut <= nextCheckIn) setCheckOut(dayAfter(nextCheckIn)) }} /></span>
        </label>
        <label className="search-field">
          <CalendarDays size={17} />
          <span><small>CHECK OUT</small><input type="date" value={checkOut} min={dayAfter(checkIn)} onChange={(event) => setCheckOut(event.target.value)} /></span>
        </label>
        <label className="search-field guest-field">
          <UsersRound size={17} />
          <span><small>GUESTS</small><select value={guests} onChange={(event) => setGuests(Number(event.target.value))}>{[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'guest' : 'guests'}</option>)}</select></span>
          <ChevronDown size={15} />
        </label>
        <a className="search-button" href="#rooms">Explore stays <ArrowRight size={16} /></a>
      </section>

      <section className="experience-dashboard" id="welcome">
        <div className="dashboard-heading">
          <div className="welcome-label"><span>01</span><span className="rule" /><span>THE HOUSE, IN ITS BEST LIGHT</span></div>
          <div className="dashboard-heading-copy">
            <h2>A stay with a few <em>different views.</em></h2>
            <p>Look around the rooms, step into the countryside, or take the afternoon poolside.</p>
          </div>
        </div>
        <div className="scene-tabs" role="tablist" aria-label="Explore the property">
          {propertyScenes.map((scene, index) => {
            const SceneIcon = scene.icon
            return (
              <button className={activeSceneId === scene.id ? 'scene-tab active' : 'scene-tab'} key={scene.id} id={`scene-tab-${scene.id}`} type="button" role="tab" aria-selected={activeSceneId === scene.id} aria-controls="scene-panel" onClick={() => setActiveSceneId(scene.id)}>
                <img src={scene.imageUrl.replace('w=1800', 'w=420')} alt="" />
                <span className="scene-tab-meta"><small>0{index + 1}</small><SceneIcon size={15} /></span>
                <strong>{scene.label}</strong>
              </button>
            )
          })}
        </div>
        <div className="scene-panel" id="scene-panel" role="tabpanel" aria-labelledby={`scene-tab-${activeScene.id}`} key={activeScene.id}>
          <div className="scene-image-wrap">
            <img src={activeScene.imageUrl} alt={activeScene.imageAlt} />
            <span className="scene-image-note"><Compass size={14} /> {activeScene.note}</span>
          </div>
          <div className="scene-copy">
            <p className="eyebrow dark-eyebrow">A LITTLE MORE THAN A ROOM</p>
            <h3>{activeScene.title}</h3>
            <p>{activeScene.description}</p>
            <div className="scene-copy-footer"><span><activeScene.icon size={17} /> {activeScene.label}</span><a href={activeScene.id === 'interiors' ? '#rooms' : '#offers'}>{activeScene.id === 'interiors' ? 'Find your room' : 'Make a day of it'} <ArrowRight size={15} /></a></div>
          </div>
        </div>
      </section>

      <section className="offers-section" id="offers">
        <div className="offers-heading">
          <div><p className="eyebrow dark-eyebrow">{currentMonthName.toUpperCase()} · THE MONTH-END EDIT</p><h2>A few good things to <em>add to your stay.</em></h2></div>
          <p>Thoughtful little extras and a room made for sharing. Choose one to start planning.</p>
        </div>
        <div className="offer-grid">
          <article className="offer-card offer-breakfast">
            <div className="offer-image"><img src="https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=85" alt="A beautifully prepared breakfast" /><span>01 / SLOW MORNING</span></div>
            <div className="offer-content"><p className="offer-type">BREAKFAST, AT YOUR PACE</p><h3>Let the morning come to you.</h3><p>Add the house breakfast to your stay, served up before the day begins.</p><div className="offer-bottom"><span>From <strong>{formatCurrency(bookingOptions.breakfastPerGuestPerNight)}</strong> / guest, per night</span><button type="button" onClick={() => addOfferToCart(2, 'breakfast')}>Add breakfast <ArrowRight size={15} /></button></div></div>
          </article>
          <article className="offer-card offer-arrival">
            <div className="offer-image"><img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1000&q=85" alt="A car ready for a country house arrival" /><span>02 / EASY ARRIVAL</span></div>
            <div className="offer-content"><p className="offer-type">AIRPORT TRANSFERS</p><h3>From arrivals to unwinding.</h3><p>Request a private ride to the house and back, with the details waiting in your booking.</p><div className="offer-bottom"><span><strong>{formatCurrency(bookingOptions.airportPickup)}</strong> / ride, each way</span><button type="button" onClick={() => addOfferToCart(7, 'transfers')}>Arrange a ride <ArrowRight size={15} /></button></div></div>
          </article>
          <article className="offer-card offer-family">
            <div className="offer-image"><img src={sampleRooms[8].imageUrl} alt="A spacious family suite" /><span>03 / ROOM FOR EVERYONE</span></div>
            <div className="offer-content"><p className="offer-type">THE FAMILY GARDEN SUITE</p><h3>Bring everyone along.</h3><p>Two sleeping areas, a dedicated lounge, and space for up to four guests.</p><div className="offer-bottom"><span>From <strong>{formatCurrency(sampleRooms[8].pricePerNight)}</strong> / night</span><button type="button" onClick={() => addOfferToCart(9, 'none')}>Add the suite <ArrowRight size={15} /></button></div></div>
          </article>
        </div>
        <p className="offer-footnote">All extras are optional and priced clearly in your booking summary.</p>
      </section>

      <section className="rooms-section" id="rooms">
        <div className="section-heading">
          <div><p className="eyebrow dark-eyebrow">THE HOUSE, ROOM BY ROOM</p><h2>Stay a little <em>closer.</em></h2></div>
          <p className="dates-note"><CalendarDays size={15} /> {formatDate(checkIn)} — {formatDate(checkOut)} <span>·</span> {stayNights} nights</p>
        </div>
        {!apiOnline && <p className="connection-note"><span /> Previewing our rooms. Booking and secure checkout connect when the API is configured.</p>}
        <div className="room-grid">
          {visibleRooms.map((room, index) => (
            <article className="room-card" key={room.id} style={{ animationDelay: `${index * 90}ms` }}>
              <div className="room-image-wrap">
                <img src={room.imageUrl} alt={room.name} />
                <span className="room-number">0{index + 1}</span>
                <button className="gallery-trigger" type="button" aria-label={`View ${room.name} photo gallery`} onClick={() => { setGalleryRoom(room); setGalleryIndex(0) }}>
                  <Images size={15} /> <span>{room.imageUrls.length} photos</span>
                </button>
              </div>
              <div className="room-content">
                <div className="room-title-row"><h3>{room.name}</h3><span><UsersRound size={14} /> {room.capacity}</span></div>
                <p>{room.description}</p>
                <div className="room-amenities">
                  {room.hasWifi && <span><Wifi size={13} /> Wi-Fi</span>}
                  {room.hasAirConditioning && <span><Snowflake size={13} /> Air conditioning</span>}
                  {room.hasDedicatedLivingRoom && <span><Sofa size={13} /> Living room</span>}
                </div>
                <div className="room-footer"><span><strong>{formatCurrency(room.pricePerNight)}</strong> / night</span><button type="button" onClick={() => addRoomToCart(room)}>Add to cart <ShoppingBag size={14} /></button></div>
              </div>
            </article>
          ))}
        </div>
        {apiOnline && visibleRooms.length === 0 && <p className="empty-rooms">No rooms are available for those dates and guest count. Try another stay.</p>}
      </section>

      <section className="details-band" id="details">
        <div><span className="details-icon"><ShieldCheck size={19} /></span><p><strong>Payment, privately handled.</strong><br />Checkout is hosted by Stripe. Card details never touch our servers.</p></div>
        <div><span className="details-icon"><Clock3 size={19} /></span><p><strong>Plans can change.</strong><br />Your room is held for 30 minutes while you complete payment.</p></div>
        <a href="mailto:stay@hearthhouse.example">A question before you book? <ArrowRight size={15} /></a>
      </section>

      <footer className="footer"><a className="brand" href="#top"><span className="brand-mark"><BedDouble size={18} /></span><span>hearth<span className="brand-light">house</span></span></a><span>Made for unhurried days.</span><span>© Hearth House 2026</span></footer>

      {cartOpen && (
        <div className="cart-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false) }}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <header className="cart-header">
              <div><p className="eyebrow dark-eyebrow">YOUR SELECTION · {cartItemCount} {cartItemCount === 1 ? 'ITEM' : 'ITEMS'}</p><h2 id="cart-title">Your stay</h2></div>
              <button className="icon-button" type="button" aria-label="Close cart" onClick={() => setCartOpen(false)}><X size={20} /></button>
            </header>
            {cartMessage && <p className="cart-message" role="alert">{cartMessage}</p>}
            {!cartRoom ? <div className="cart-empty"><span><ShoppingBag size={23} /></span><h3>Your cart is taking a breather.</h3><p>Add a room or one of this month's picks to start planning.</p><button className="primary-button" type="button" onClick={() => { setCartOpen(false); document.querySelector('#rooms')?.scrollIntoView({ behavior: 'smooth' }) }}>Explore the rooms <ArrowRight size={15} /></button></div> : <>
              <article className="cart-room-line">
                <img src={cartRoom.imageUrl} alt={cartRoom.name} />
                <div className="cart-room-copy"><span>YOUR ROOM</span><h3>{cartRoom.name}</h3><p>{formatDate(checkIn)} — {formatDate(checkOut)} · {stayNights} {stayNights === 1 ? 'night' : 'nights'} · {guests} guests</p></div>
                <button className="cart-remove" type="button" aria-label={`Remove ${cartRoom.name}`} onClick={() => { updateCart({ room: null, breakfast: false, airportPickup: false, airportDropoff: false }); setCartMessage('') }}><Trash2 size={16} /></button>
              </article>
              <section className="cart-addons" aria-labelledby="cart-addons-title">
                <h3 id="cart-addons-title">Add a little extra</h3>
                <label className="cart-addon">
                  <input type="checkbox" checked={cartBreakfast} onChange={(event) => updateCart({ breakfast: event.target.checked })} />
                  <span><strong>Breakfast</strong><small>{formatCurrency(bookingOptions.breakfastPerGuestPerNight)} per guest, per night</small></span>
                  <b>{formatCurrency(bookingOptions.breakfastPerGuestPerNight * guests * stayNights)}</b>
                </label>
                <label className="cart-addon">
                  <input type="checkbox" checked={cartAirportPickup} onChange={(event) => updateCart({ airportPickup: event.target.checked })} />
                  <span><strong>Airport pickup</strong><small>Airport to Hearth House</small></span>
                  <b>{formatCurrency(bookingOptions.airportPickup)}</b>
                </label>
                <label className="cart-addon">
                  <input type="checkbox" checked={cartAirportDropoff} onChange={(event) => updateCart({ airportDropoff: event.target.checked })} />
                  <span><strong>Airport drop-off</strong><small>Hearth House to airport</small></span>
                  <b>{formatCurrency(bookingOptions.airportDropoff)}</b>
                </label>
              </section>
              <div className="cart-total"><span>Estimated stay total</span><strong>{formatCurrency(cartTotal)}</strong></div>
              <p className="cart-note">Final availability and pricing are confirmed before payment.</p>
              <button className="primary-button cart-continue" type="button" onClick={continueToBooking}>Continue to booking <ArrowRight size={16} /></button>
            </>}
          </aside>
        </div>
      )}

      {galleryRoom && (
        <div className="modal-backdrop gallery-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setGalleryRoom(null) }}>
          <section className="gallery-dialog" role="dialog" aria-modal="true" aria-label={`${galleryRoom.name} photo gallery`}>
            <header className="gallery-header">
              <div><p className="eyebrow dark-eyebrow">ROOM GALLERY · {galleryRoom.imageUrls.length} PHOTOS</p><h2>{galleryRoom.name}</h2></div>
              <button className="icon-button" type="button" aria-label="Close photo gallery" onClick={() => setGalleryRoom(null)}><X size={20} /></button>
            </header>
            <div className="gallery-stage">
              <img src={galleryRoom.imageUrls[galleryIndex]} alt={`${galleryRoom.name}, photo ${galleryIndex + 1} of ${galleryRoom.imageUrls.length}`} />
              <button className="gallery-arrow gallery-previous" type="button" aria-label="Previous photo" onClick={() => setGalleryIndex((galleryIndex - 1 + galleryRoom.imageUrls.length) % galleryRoom.imageUrls.length)}><ChevronLeft size={22} /></button>
              <button className="gallery-arrow gallery-next" type="button" aria-label="Next photo" onClick={() => setGalleryIndex((galleryIndex + 1) % galleryRoom.imageUrls.length)}><ChevronRight size={22} /></button>
              <span className="gallery-counter">{galleryIndex + 1} / {galleryRoom.imageUrls.length}</span>
            </div>
            <div className="gallery-thumbnails" aria-label="Choose a photo">
              {galleryRoom.imageUrls.map((imageUrl, index) => (
                <button className={galleryIndex === index ? 'gallery-thumbnail active' : 'gallery-thumbnail'} key={imageUrl} type="button" aria-label={`Show photo ${index + 1}`} aria-pressed={galleryIndex === index} onClick={() => setGalleryIndex(index)}>
                  <img src={imageUrl} alt="" />
                </button>
              ))}
            </div>
            <footer className="gallery-footer">
              <div className="gallery-amenities">
                {galleryRoom.hasWifi && <span><Wifi size={14} /> Wi-Fi</span>}
                {galleryRoom.hasAirConditioning && <span><Snowflake size={14} /> Air conditioning</span>}
                {galleryRoom.hasDedicatedLivingRoom && <span><Sofa size={14} /> Living room</span>}
              </div>
              <div className="gallery-booking"><span><strong>{formatCurrency(galleryRoom.pricePerNight)}</strong> / night</span><button className="primary-button" type="button" onClick={() => { const room = galleryRoom; setGalleryRoom(null); addRoomToCart(room) }}>Add this room <ShoppingBag size={15} /></button></div>
            </footer>
          </section>
        </div>
      )}

      {selectedRoom && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRoom(null) }}>
          <section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
            <button className="icon-button modal-close" type="button" aria-label="Close" onClick={() => setSelectedRoom(null)}><X size={19} /></button>
            {!booking ? <>
              <p className="eyebrow dark-eyebrow">YOUR STAY, YOUR WAY</p>
              <h2 id="booking-title">Make it <em>yours.</em></h2>
              <div className="booking-summary"><img src={selectedRoom.imageUrl} alt="" /><div><strong>{selectedRoom.name}</strong><span>{formatDate(checkIn)} — {formatDate(checkOut)} · {stayNights} nights</span></div></div>
              <div className="extra-options">
                <p className="extras-heading">MAKE YOUR STAY YOURS</p>
                <label className="extra-option">
                  <input type="checkbox" checked={addBreakfast} onChange={(event) => { setAddBreakfast(event.target.checked); updateCart({ breakfast: event.target.checked }) }} />
                  <span className="extra-icon"><Coffee size={17} /></span>
                  <span className="extra-copy"><strong>Breakfast</strong><small>{formatCurrency(bookingOptions.breakfastPerGuestPerNight)} per guest, per night</small></span>
                  <b>{formatCurrency(bookingOptions.breakfastPerGuestPerNight * guests * stayNights)}</b>
                </label>
                <label className="extra-option">
                  <input type="checkbox" checked={airportPickup} onChange={(event) => { setAirportPickup(event.target.checked); updateCart({ airportPickup: event.target.checked }) }} />
                  <span className="extra-icon"><CarFront size={17} /></span>
                  <span className="extra-copy"><strong>Airport pickup</strong><small>Airport to Hearth House</small></span>
                  <b>{formatCurrency(bookingOptions.airportPickup)}</b>
                </label>
                <label className="extra-option">
                  <input type="checkbox" checked={airportDropoff} onChange={(event) => { setAirportDropoff(event.target.checked); updateCart({ airportDropoff: event.target.checked }) }} />
                  <span className="extra-icon"><CarFront size={17} /></span>
                  <span className="extra-copy"><strong>Airport drop-off</strong><small>Hearth House to airport</small></span>
                  <b>{formatCurrency(bookingOptions.airportDropoff)}</b>
                </label>
              </div>
              <div className="price-breakdown">
                <span>Room · {stayNights} nights <b>{formatCurrency(roomSubtotal)}</b></span>
                {addBreakfast && <span>Breakfast · {guests} guests <b>{formatCurrency(breakfastTotal)}</b></span>}
                {airportPickup && <span>Airport pickup <b>{formatCurrency(pickupTotal)}</b></span>}
                {airportDropoff && <span>Airport drop-off <b>{formatCurrency(dropoffTotal)}</b></span>}
                <strong>Total <b>{formatCurrency(roomSubtotal + extrasTotal)}</b></strong>
              </div>
              <form className="booking-form" onSubmit={submitBooking}>
                <label>Your name<input required maxLength={120} autoComplete="name" value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Alex Morgan" /></label>
                <label>Email address<input required type="email" maxLength={254} autoComplete="email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="alex@example.com" /></label>
                <button className="primary-button" disabled={saving || !apiOnline} type="submit">{saving ? 'Preparing your stay…' : <>Continue to secure payment <ArrowRight size={16} /></>}</button>
                {message && <p className="form-message" role="alert">{message}</p>}
                {!apiOnline && <p className="form-hint">The booking service is offline. Connect the API to reserve this room.</p>}
              </form>
              <p className="secure-note"><ShieldCheck size={15} /> Secure payment by Stripe. No card details stored here.</p>
            </> : <div className="booking-confirmed">
              <span className="success-mark"><Check size={23} /></span>
              <p className="eyebrow dark-eyebrow">ROOM HELD FOR 30 MINUTES</p>
              <h2 id="booking-title">Nearly <em>there.</em></h2>
              <p>Your room is reserved while you finish payment. Your private booking reference is ready.</p>
              <div className="reference-box"><small>BOOKING REFERENCE</small><code>{booking.bookingId}</code><small>PRIVATE ACCESS TOKEN · SAVE SECURELY</small><code>{booking.bookingToken}</code><span>Keep this token private. You need it to view your booking.</span></div>
              <p className="form-message" role="status">{message}</p>
              <button className="primary-button" type="button" onClick={() => { setBooking(null); setSelectedRoom(null); setLookupId(booking.bookingId); setLookupToken(booking.bookingToken); setFoundBooking(null); setLookupOpen(true) }}>View booking details <ArrowRight size={16} /></button>
            </div>}
          </section>
        </div>
      )}

      {lookupOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLookupOpen(false) }}>
          <section className="booking-modal lookup-modal" role="dialog" aria-modal="true" aria-labelledby="lookup-title">
            <button className="icon-button modal-close" type="button" aria-label="Close" onClick={() => setLookupOpen(false)}><X size={19} /></button>
            <p className="eyebrow dark-eyebrow">YOUR HEARTH HOUSE STAY</p>
            <h2 id="lookup-title">Welcome <em>back.</em></h2>
            {!foundBooking ? <form className="booking-form" onSubmit={findBooking}>
              <label>Booking reference<input required value={lookupId} onChange={(event) => setLookupId(event.target.value)} placeholder="Your booking ID" /></label>
              <label>Private access token<input required value={lookupToken} onChange={(event) => setLookupToken(event.target.value)} placeholder="Shown when you booked" /></label>
              <button className="primary-button" type="submit">Find my booking <ArrowRight size={16} /></button>
              {lookupMessage && <p className="form-message" role="alert">{lookupMessage}</p>}
              <p className="form-hint">Your access token was shown once after booking. It is not your payment information.</p>
            </form> : <div className="stay-detail">
              <div className="stay-status"><span className={foundBooking.status === 'confirmed' ? 'status-dot confirmed' : 'status-dot'} />{foundBooking.status.replace('_', ' ')}</div>
              <h3>{foundBooking.roomName}</h3>
              <p>{foundBooking.guestName} · {foundBooking.guests} {foundBooking.guests === 1 ? 'guest' : 'guests'}</p>
              <div className="stay-amenities">
                {foundBooking.hasWifi && <span><Wifi size={13} /> Wi-Fi</span>}
                {foundBooking.hasAirConditioning && <span><Snowflake size={13} /> Air conditioning</span>}
                {foundBooking.hasDedicatedLivingRoom && <span><Sofa size={13} /> Living room</span>}
              </div>
              <div className="stay-dates"><span><small>CHECK IN</small><strong>{formatDate(foundBooking.checkIn)}</strong></span><ArrowRight size={16} /><span><small>CHECK OUT</small><strong>{formatDate(foundBooking.checkOut)}</strong></span></div>
              <div className="stay-breakdown">
                <span>Room subtotal <b>{formatCurrency(foundBooking.roomSubtotal)}</b></span>
                {foundBooking.includesBreakfast && <span>Breakfast <b>{formatCurrency(foundBooking.breakfastTotal)}</b></span>}
                {foundBooking.airportPickup && <span>Airport pickup <b>{formatCurrency(foundBooking.airportPickupPrice)}</b></span>}
                {foundBooking.airportDropoff && <span>Airport drop-off <b>{formatCurrency(foundBooking.airportDropoffPrice)}</b></span>}
                <strong>{foundBooking.paymentStatus === 'paid' ? 'Payment received' : 'Total stay'} <b>{formatCurrency(foundBooking.totalPrice)}</b></strong>
              </div>
              <div className="private-token"><small>PRIVATE ACCESS TOKEN</small><code>{lookupToken}</code><span>Keep this with your booking reference to view your stay later.</span></div>
              <button className="quiet-button" type="button" onClick={() => setFoundBooking(null)}>Look up a different booking</button>
            </div>}
          </section>
        </div>
      )}
    </main>
  )
}

export default App
