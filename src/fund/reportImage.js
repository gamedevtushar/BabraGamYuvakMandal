const fontFamily = '"Inter", "Hind Vadodara", sans-serif'

/** Draw the complete annual ledger independently of the screen size and scroll position. */
export async function saveReportImage({year,opening,months,income,expense,balance,labels,formatAmount}) {
  // Use the app fonts when ready; a slow font request must not block saving a report.
  await Promise.race([
    Promise.all([document.fonts.ready,document.fonts.load(`600 32px "Inter"`),document.fonts.load(`600 32px "Hind Vadodara"`)]).catch(()=>{}),
    new Promise(resolve=>setTimeout(resolve,3000)),
  ])
  const canvas=document.createElement('canvas')
  canvas.width=2400; canvas.height=2200
  const ctx=canvas.getContext('2d')
  if(!ctx)throw new Error(labels.failed)
  ctx.scale(2,2)
  const backdrop=ctx.createLinearGradient(0,0,1200,1100)
  backdrop.addColorStop(0,'#fff4dd');backdrop.addColorStop(.55,'#f6e2ec');backdrop.addColorStop(1,'#e9dff5')
  ctx.fillStyle=backdrop;ctx.fillRect(0,0,1200,1100)
  const box=(x,y,width,height,radius,fill)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,width,height,radius);ctx.fill()}
  const text=(value,x,y,{size=25,color='#39354c',weight=500,align='left',width}={})=>{
    ctx.textAlign=align;ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${fontFamily}`
    if(width)while(ctx.measureText(String(value)).width>width&&size>16){size--;ctx.font=`${weight} ${size}px ${fontFamily}`}
    ctx.fillText(String(value),x,y)
  }
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
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'))
  if(!blob)throw new Error(labels.failed)
  const url=URL.createObjectURL(blob),link=document.createElement('a')
  link.href=url;link.download=`BabraGamYuvakMandal-${year}-report.png`
  document.body.append(link);link.click();link.remove()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}
