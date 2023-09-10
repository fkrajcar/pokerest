import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, res: NextResponse) {
  console.log('create new room', req, res)

  return NextResponse.json({ id: 'roomId' })
}
