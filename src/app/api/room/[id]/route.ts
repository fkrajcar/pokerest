import { NextRequest, NextResponse } from 'next/server'

type ParamsType = {
  id: string
}

export async function GET(
  req: NextRequest,
  { params }: { params: ParamsType }
) {
  console.log(params.id, 'ali ID')
  return NextResponse.json({ id: 'roomId' })
}
