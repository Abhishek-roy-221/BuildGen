import React, { forwardRef, useRef } from 'react'
import type { Project } from '../types'

interface ProjectPreviewProps {
    project: Project;
    isGenerating: boolean;
    device?: 'phone' | 'tablet' | 'desktop';
    showEditorPanel?: boolean;

}

export interface ProjectPreviewRef {
    getCode: ()=> string | undefined;

}

const ProjectPreview = forwardRef<ProjectPreviewRef , ProjectPreviewProps>((
    {project , isGenerating , device = 'desktop', showEditorPanel = true},ref ) => {

        const iframeRef = useRef<HTMLIFrameElement>(null)

  return (
    <div className='relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden 
    max-sm:ml-2'>
      {project.current_code ? (
        <>
        <iframe
        ref={iframeRef}
        srcDoc=''
        />
        </>
      ): isGenerating && (
        <div>
loading
        </div>
      )}
    </div>
  )
})

export default ProjectPreview
