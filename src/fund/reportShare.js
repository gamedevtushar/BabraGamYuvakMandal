export function downloadReportFile(file) {
  const url=URL.createObjectURL(file),link=document.createElement('a')
  link.href=url;link.download=file.name
  document.body.append(link);link.click();link.remove()
  setTimeout(()=>URL.revokeObjectURL(url),60000)
}

export async function shareReportFile(file,title,shareApi=navigator) {
  if(!shareApi.share||!shareApi.canShare||!shareApi.canShare({files:[file]}))return 'unsupported'
  try{
    await shareApi.share({files:[file],title})
    return 'shared'
  }catch(error){
    if(error.name==='AbortError')return 'cancelled'
    throw error
  }
}

// Keep saving and invoking the native chooser in the same tap, without rendering or waiting first.
export function saveAndShareReportFile(file,title,{save=downloadReportFile,shareApi=navigator}={}) {
  save(file)
  return shareReportFile(file,title,shareApi)
}
