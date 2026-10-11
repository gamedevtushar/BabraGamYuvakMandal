const fontFamily = '"Inter", "Hind Vadodara", sans-serif'

async function readyFonts() {
  // Use the app fonts when ready; a slow font request must not block saving a report.
  await Promise.race([
    Promise.all([document.fonts.ready,document.fonts.load(`600 32px "Inter"`),document.fonts.load(`600 32px "Hind Vadodara"`)]).catch(()=>{}),
    new Promise(resolve=>setTimeout(resolve,3000)),
  ])
}

function reportCanvas(height) {
  const canvas=document.createElement('canvas')
  canvas.width=2400; canvas.height=height*2
  const ctx=canvas.getContext('2d')
  if(!ctx)throw new Error('Canvas is unavailable')
  ctx.scale(2,2)
  const backdrop=ctx.createLinearGradient(0,0,1200,height)
  backdrop.addColorStop(0,'#fff4dd');backdrop.addColorStop(.55,'#f6e2ec');backdrop.addColorStop(1,'#e9dff5')
  ctx.fillStyle=backdrop;ctx.fillRect(0,0,1200,height)
  const box=(x,y,width,height,radius,fill)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,width,height,radius);ctx.fill()}
  const text=(value,x,y,{size=25,color='#39354c',weight=500,align='left',width}={})=>{
    ctx.textAlign=align;ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${fontFamily}`
    if(width)while(ctx.measureText(String(value)).width>width&&size>16){size--;ctx.font=`${weight} ${size}px ${fontFamily}`}
    if(width)ctx.fillText(String(value),x,y,width)
    else ctx.fillText(String(value),x,y)
  }
  return {canvas,ctx,box,text}
}

async function reportFile(canvas,period,failed) {
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'))
  if(!blob)throw new Error(failed)
  return new File([blob],`BabraGamYuvakMandal-${period}-report.png`,{type:'image/png'})
}

/** Prepare the complete annual ledger before the download tap, preserving share activation. */
export async function createAnnualReportImage({year,opening,months,income,expense,balance,labels,formatAmount}) {
  await readyFonts()
  const {canvas,box,text}=reportCanvas(1100)
  text(labels.name,60,78,{size:39,weight:700,width:1050})
  text(`${labels.report} · ${year}`,60,121,{size:25,color:'#6c6174'})
  box(48,155,1104,64,18,'#fff7f0')
  text(labels.opening,72,197,{size:25})
  text(formatAmount(opening),1128,197,{weight:700,align:'right',width:380})
  box(48,239,1104,728,22,'#fff8f4')
  box(48,239,1104,58,18,'#e7dcf5')
  const columns=[72,606,852,1128]
  labels.columns.forEach((label,index)=>text(label,columns[index],278,{size:24,weight:700,align:index?'right':'left',width:index?225:300}))
  months.forEach((row,index)=>{
    const y=297+index*51
    if(index%2===0)box(49,y,1102,51,0,'#fcf0f1')
    text(row.label,72,y+34,{width:280})
    text(formatAmount(row.income),606,y+34,{color:'#266356',align:'right',width:230})
    text(formatAmount(row.out),852,y+34,{color:'#a73764',align:'right',width:230})
    text(formatAmount(row.balance),1128,y+34,{weight:600,align:'right',width:254})
  })
  const totalY=922
  box(48,totalY-13,1104,58,16,'#e7dcf5')
  text(labels.total,72,totalY+25,{weight:700})
  text(formatAmount(income),606,totalY+25,{weight:700,color:'#266356',align:'right',width:230})
  text(formatAmount(expense),852,totalY+25,{weight:700,color:'#a73764',align:'right',width:230})
  text(formatAmount(balance),1128,totalY+25,{weight:700,align:'right',width:254})
  text(labels.closing,60,1025,{size:23,color:'#6c6174'})
  text(formatAmount(balance),1140,1025,{size:31,weight:700,align:'right',width:480})
  return reportFile(canvas,year,labels.failed)
}

/** Every member and other entry in the selected month, including rows below the screen. */
export async function createMonthlyReportImage({period,periodTitle,people,entries,opening,income,expense,balance,contributed,notContributed,labels,formatAmount}) {
  await readyFonts()
  // Measure wrapped names/descriptions before sizing the image; no scroll capture or truncation.
  const measure=document.createElement('canvas').getContext('2d')
  if(!measure)throw new Error(labels.failed)
  measure.font=`500 26px ${fontFamily}`
  const wrap=value=>{
    const lines=[];let line=''
    for(const word of String(value||'—').split(/\s+/)){
      const candidate=line?`${line} ${word}`:word
      if(line&&measure.measureText(candidate).width>810){lines.push(line);line=word}else line=candidate
    }
    if(line)lines.push(line)
    return lines
  }
  const memberRows=people.map(row=>({...row,lines:wrap(row.name)})).map(row=>({...row,height:Math.max(62,row.lines.length*34+24)}))
  const entryRows=entries.map(row=>({...row,lines:wrap(row.title)})).map(row=>({...row,height:row.lines.length*34+56}))
  const membersHeight=memberRows.reduce((sum,row)=>sum+row.height,0)||62
  const entriesHeight=entryRows.reduce((sum,row)=>sum+row.height,0)||62
  const height=620+membersHeight+entriesHeight
  const {canvas,box,text}=reportCanvas(height)
  text(labels.name,60,78,{size:39,weight:700,width:1050})
  text(`${labels.report} · ${periodTitle}`,60,121,{size:25,color:'#6c6174',width:1050})
  box(48,155,1104,64,18,'#fff7f0')
  text(labels.opening,72,197)
  text(formatAmount(opening),1128,197,{weight:700,align:'right',width:380})
  const figures=[[labels.received,contributed,'#266356'],[labels.notContributed,notContributed,'#6c6174'],[labels.income,formatAmount(income),'#266356'],[labels.expense,formatAmount(expense),'#a73764']]
  figures.forEach(([label,value,color],index)=>{
    const x=48+index*280
    box(x,237,264,94,18,'#fff8f4')
    text(label,x+20,273,{size:21,color:'#6c6174',width:224})
    text(value,x+20,311,{size:29,weight:700,color,width:224})
  })
  let y=353
  box(48,y,1104,52,16,'#e7dcf5')
  text(labels.members,72,y+35,{size:25,weight:700,width:800});text(labels.amount,1128,y+35,{size:25,weight:700,align:'right',width:240})
  y+=64
  memberRows.forEach(row=>{
    box(48,y,1104,row.height-8,16,row.paid?'#d7eee5':'#fff8f4')
    row.lines.forEach((line,index)=>text(line,72,y+36+index*34,{size:26,width:810}))
    text(formatAmount(row.amount),1128,y+row.height/2+7,{weight:700,color:row.paid?'#266356':'#6c6174',align:'right',width:240})
    y+=row.height
  })
  if(!memberRows.length){text(labels.noMembers,72,y+38,{color:'#6c6174'});y+=62}
  y+=18
  box(48,y,1104,52,16,'#e7dcf5');text(labels.otherEntries,72,y+35,{weight:700,width:1050});y+=64
  entryRows.forEach(row=>{
    box(48,y,1104,row.height-8,16,'#fff8f4')
    row.lines.forEach((line,index)=>text(line,72,y+36+index*34,{size:26,width:810}))
    text(row.dateLabel,72,y+row.height-20,{size:20,color:'#6c6174',width:800})
    text(`${row.incoming?'+':'−'}${formatAmount(row.amount)}`,1128,y+row.height/2+7,{weight:700,color:row.incoming?'#266356':'#a73764',align:'right',width:240})
    y+=row.height
  })
  if(!entryRows.length){text(labels.empty,72,y+38,{color:'#6c6174',width:1050});y+=62}
  y+=26
  text(labels.closing,60,y+30,{size:25,color:'#6c6174'})
  text(formatAmount(balance),1140,y+30,{size:31,weight:700,align:'right',width:480})
  return reportFile(canvas,period,labels.failed)
}
