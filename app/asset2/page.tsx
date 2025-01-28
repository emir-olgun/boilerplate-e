"use server"
import { cookies } from 'next/headers'
import * as jose from 'jose'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import TokenGatedDemoPage from './asset2page'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

interface Policy {
  id: string;
  policyID: string;
  createdAt: string;
  updatedAt: string;
}

export default async function Page() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    redirect('/login')
    return null // This line is necessary to satisfy TypeScript
  }

  const response = await fetch(`${process.env.ROOT_URL}/api/policy`);
  if (!response.ok) {
    throw new Error(`Failed to fetch policies: ${response.statusText}`);
  }
  const data: Policy[] = await response.json();
  const { payload } = await jose.jwtVerify(token.value, JWT_SECRET)

  // Set the cookie_support_check cookie if it doesn't exist
  if (!cookieStore.get('cookie_support_check')) {
    const response = NextResponse.next()
    response.cookies.set({
      name: 'cookie_support_check',
      value: '1',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    })
    return response
  }

  const userData = {
    walletAddress: payload.walletAddress,
    email: payload.email,
    walletNetwork: payload.walletNetwork,
    roles: payload.roles as string[],
  }

  if (!userData.roles.includes(data[1].policyID)) {
    redirect('/')
  }
  return (
    <TokenGatedDemoPage />
  )
}
