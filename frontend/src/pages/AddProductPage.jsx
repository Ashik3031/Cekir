import React from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { AddProduct } from '../features/admin/components/AddProduct'

export const AddProductPage = () => {
  return (
    <>
    <Navbar/>
    <div className='pt-[55px]'>
    <AddProduct/>
    </div>
    </>
  )
}
