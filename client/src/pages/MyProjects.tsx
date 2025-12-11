import React, { useEffect, useState } from 'react'
import type { Project } from '../types';
import { Loader2Icon, PlusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dummyProjects } from '../assets/assets';

const MyProjects = () => {

  const [loading,setLoading] = useState(true);
  const [projects,setProjects] = useState<Project[]>([])
  const navigate = useNavigate()

  const fetchProjects = async ()=> {
    setProjects(dummyProjects)
// simulating loading thing

setTimeout(()=>{
setLoading(false)
},1000)
  }

  useEffect(()=>{
fetchProjects()
  },[])

  return (
    <>
      <div className='px-4 md:px-16 lg:px-24 xl:px-32'>
        {loading ? (
          <div className='flex items-center justify-center h-[80vh]'> 
<Loader2Icon className='size-7 animate-spin text-indigo-200'/>
          </div>
        ) : projects.length > 0 ? (
          <div className='py-10 min-h-[80vh]'> 
<div className='flex items-center justify-between mb-12'>
  <h1 className='text-2xl font-medium text-white'>My projects</h1>
  <button onClick={()=> navigate('/')} className='flex items-center gap-3 text-white px-3 sm:px-6 
  py-1 sm:py-2 rounded bg-linear-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all
  '><PlusIcon size={18}/> Create new</button>
</div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-[80vh]'>
<h1 className='text-3xl font-semibold text-gray-300'>You have no projects yet !</h1>
<button onClick={()=> navigate('/')} className='text-white px-5 py-2 mt-5 rounded-md bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all'>
  Create new
</button>
          </div>
        )}
      </div>
    </>
  )
}

export default MyProjects
