'use client'
import { useSession, signIn, signOut } from "next-auth/react"


export default function Header(){
    return <div>
        <button onClick={()=>signIn()}>signin</button>
        <button onClick={()=>signOut()}>signOut</button>
    </div>
}