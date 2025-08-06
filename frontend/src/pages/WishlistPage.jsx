import React from 'react'
import { Wishlist } from '../features/wishlist/components/Wishlist'
import {Navbar} from '../features/navigation/components/Navbar'
import { Footer } from '../features/footer/Footer'

export const WishlistPage = () => {
  return (
    <>
    <Navbar/>
    <div className='pt-[45px]'>
    <Wishlist/>
    </div>
    <Footer/>
    </>
  )
}
