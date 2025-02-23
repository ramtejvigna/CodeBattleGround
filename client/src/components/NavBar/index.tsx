import React from 'react'
import Link from 'next/link'

const NavBar = () => {
    return (
        <div>
            <nav className='flex flex-row justify-between items-center p-4'>
                <Link href='/'>
                    <h1 className='cursor-pointer uppercase font-[family-name:var(--font-kanit-sans)] flex flex-col select-none'>
                        <span className='text-[9px] leading-[9px] self-start tracking-wider'>Code</span>
                        <span className='bg-gradient-to-tr from-[#F14A00] to-[#C62300] text-2xl py-1 bg-clip-text text-transparent leading-[12px] font-extrabold tracking-wide scale-y-75 transform origin-top'>
                            Battle
                        </span>
                        <span className='text-[9px] leading-[0] self-end tracking-wider'>Ground</span>
                    </h1>
                </Link>

                <div>

                </div>
            </nav>
        </div>
    )
}

export default NavBar
