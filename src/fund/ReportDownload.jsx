import {useEffect,useMemo,useState} from 'react'
import {Download} from 'lucide-react'
import {useAuth} from '../context/AuthContext'
import {IconButton,toast} from '../components/ui'
import {t} from '../i18n'
import {inr} from '../lib/format'
import {createAnnualReportImage,createMonthlyReportImage} from './reportImage'
import {saveAndShareReportFile,shareReportFile} from './reportShare'

export default function ReportDownload({report,disabled=false}) {
  const {isAdmin}=useAuth()
  const key=JSON.stringify(report)
  const data=useMemo(()=>JSON.parse(key),[key])
  const [prepared,setPrepared]=useState(null),[saving,setSaving]=useState(false)
  useEffect(()=>{
    if(!isAdmin||disabled)return
    let cancelled=false
    const create=data.period?createMonthlyReportImage:createAnnualReportImage
    create({...data,formatAmount:inr}).then(file=>{
      if(!cancelled)setPrepared({key,file})
    }).catch(error=>{
      if(!cancelled)setPrepared({key,error})
    })
    return()=>{cancelled=true}
  },[isAdmin,disabled,data,key])
  if(!isAdmin)return null
  const image=prepared?.key===key?prepared:null
  const share=()=>shareReportFile(image.file,data.labels.name).catch(()=>toast.error(t('fund.shareFailed')))
  const download=async()=>{
    if(!isAdmin||disabled||!image||saving)return
    if(image.error){toast.error(t('fund.imageFailed'));return}
    setSaving(true)
    try{
      const result=await saveAndShareReportFile(image.file,data.labels.name)
      if(result==='unsupported')toast.success(t('fund.imageSaved'))
    }catch{
      // Some browsers require a separate tap after a download before opening their chooser.
      toast.info(t('fund.imageSaved'),{action:{label:t('fund.shareImage'),onClick:share}})
    }finally{setSaving(false)}
  }
  return <IconButton icon={Download} label={t('fund.saveImage')} variant="secondary" className="size-10" disabled={disabled||!image} loading={saving} onClick={download}/>
}
