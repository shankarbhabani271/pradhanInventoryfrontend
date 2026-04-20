import React from 'react'
import { Button } from '../ui/button'

const studentpage = () => {
  return (
    <div className='min-h-screen items-center justify-center p-4'>
        <div className='ww-full max-w-full bg-white text-2xl shadow-lg p-6 space-y-6'>
  <form >
    <div className='text-center'>
        <h1 className='text-gray-900 text-4xl'>
            student form
        </h1>
        <p className=' text-gray-400'>
            fill in the box 
        </p>
    </div>
    <div>
        <label className='block text-sm mb-1'>
    student name 
        </label>
        <input 
        type='text'
        placeholder='enter the student name'
        className='w-full border-rounded-lg px-4 py-2'/>
    </div>
    <div>
        <label className='block text-sm mb-1'>
            student Rollnumber 
             
        </label>
        <input 
        type='text'
        placeholder='enter the rollnumber '
        className='w-full border-rounded-lg px-4 py-2 border:outline-none'/>
    </div>
    <div>
        <Button
         //type='' 
         className='bg-blue-600'>
            Enter
        </Button>
    </div>
  </form>
        </div>
      
    </div>
  )
}

export default studentpage
