const createdRoomCodes = new Set<string>()

const CODE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function randomCodePart(length: number) {
  const values = new Uint32Array(length)
  crypto.getRandomValues(values)
  return Array.from(values, (value) => CODE_CHARACTERS[value % CODE_CHARACTERS.length]).join('')
}

export function createMockParty() {
  let roomCode = ''

  do {
    roomCode = `PARTY${randomCodePart(2)}`
  } while (createdRoomCodes.has(roomCode))

  createdRoomCodes.add(roomCode)

  return {
    roomCode,
    roomId: `room-${crypto.randomUUID()}`,
  }
}
