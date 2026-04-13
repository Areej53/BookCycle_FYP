import { PALETTE } from '../constants'
const Toast = ({ toast }) => (
  <div style={{
    position:'fixed',bottom:28,right:28,zIndex:9999,
    background:PALETTE.primary,color:PALETTE.bg,
    padding:'11px 18px',borderRadius:11,fontSize:'.88rem',fontWeight:500,
    display:'flex',alignItems:'center',gap:8,
    boxShadow:'0 6px 24px rgba(19,73,60,.3)',
    transform: toast.show ? 'translateY(0)' : 'translateY(60px)',
    opacity: toast.show ? 1 : 0,
    transition:'transform .3s cubic-bezier(.34,1.56,.64,1),opacity .3s',
    pointerEvents:'none',
  }}>
    <span style={{width:6,height:6,borderRadius:'50%',flexShrink:0,
      background: toast.err ? PALETTE.cta : PALETTE.accent}}/>
    {toast.msg}
  </div>
)
export default Toast
