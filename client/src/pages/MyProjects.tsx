import React, { useEffect, useState } from 'react'
import type { Project } from '../types';
import { Loader2Icon, PlusIcon } from 'lucide-react';

const MyProjects = () => {

  const [loading,setLoading] = useState(true);
  const [projects,setProjects] = useState<Project[]>([])

  const fetchProjects = async ()=> {

  }

  useEffect(()=>{
fetchProjects()
  },[])

  return (
    <>
      <div className='px-4 md:px-16 lg:px-24 xl:px-32'>
        {loading ? (
          <div className='flex items-center justify-center h-[80vh]'> 
<Loader2Icon className='size-4 animate-spin text-indigo-200'/>
          </div>
        ) : projects.length > 0 ? (
          <div className='py-10 min-h-[80vh]'> 
<div className='flex items-center justify-between mb-12'>
  <h1>My projects</h1>
  <button><PlusIcon size={18}/> Create new</button>
</div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </>
  )
}

export default MyProjects
