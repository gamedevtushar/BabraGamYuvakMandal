// Display spellings only: existing Firestore names and member IDs stay unchanged.
const guNames = {
  ajay:'અજય', rameshbhai:'રમેશભાઈ', bhautik:'ભૌતિક', labhubhai:'લાભુભાઈ',
  dipak:'દીપક', punabhai:'પુનાભાઈ', hardik:'હાર્દિક', maganbhai:'મગનભાઈ',
  harshil:'હર્ષિલ', narayanbhai:'નારાયણભાઈ', het:'હેત', mukeshbhai:'મુકેશભાઈ',
  himmatbhai:'હિંમતભાઈ', hanshrajbhai:'હંસરાજભાઈ', jagdish:'જગદીશ', ghanshyambhai:'ઘનશ્યામભાઈ',
  kaushik:'કૌશિક', pravinbhai:'પ્રવીણભાઈ', keval:'કેવલ', hareshbhai:'હરેશભાઈ',
  vallabhbhai:'વલ્લભભાઈ', maan:'માન', manoj:'મનોજ', babubhai:'બાબુભાઈ',
  nilesh:'નીલેશ', chandubhai:'ચંદુભાઈ', nimesh:'નિમેષ', vinubhai:'વિનુભાઈ',
  nitin:'નીતિન', arjanbhai:'અરજણભાઈ', paras:'પારસ', paresh:'પરેશ', parbatbhai:'પરબતભાઈ',
  ravi:'રવિ', bhikhabhai:'ભીખાભાઈ', ravikaka:'રવિકાકા', sandip:'સંદીપ',
  dhanjibhai:'ધનજીભાઈ', tushar:'તુષાર', kalubhai:'કાળુભાઈ', vijay:'વિજય', haribhai:'હરિભાઈ',
}
export function memberName(member, lang) {
  const name = typeof member === 'string' ? member : member?.name || ''
  if (lang !== 'gu') return name
  if (typeof member === 'object' && member?.nameGu?.trim()) return member.nameGu.trim()
  return name.replace(/[a-z]+/gi, part => guNames[part.toLowerCase()] || part)
}
