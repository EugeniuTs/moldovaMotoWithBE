import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { SEED, STORAGE_KEY, loadDB, saveDB, uid, spotsLeft } from "../store.js";
import { fetchBookings, createBooking, updateBooking, deleteBooking, uploadMedia } from "../api.js";

// Frontend uses camelCase; backend PUT/POST expect snake_case for these fields.
const toServerBooking = (r) => ({
  type:         r.type,
  tour:         r.tour,
  departure_id: r.departureId || null,
  name:         r.name,
  email:        r.email,
  phone:        r.phone || null,
  country:      r.country || null,
  date:         r.date || null,
  date_to:      r.dateTo || null,
  rental_days:  r.rentalDays || null,
  experience:   r.experience,
  bike:         r.bike || null,
  notes:        r.notes || null,
});
import { Link as RLink } from "react-router-dom";

/* ── Design tokens ───────────────────────────────────────────── */
const T = {
  bg:"#0a0a0b", surface:"#111113", card:"#16161a", elevated:"#1c1c21",
  border:"#26262d", orange:"#ff6b00", orangeDim:"rgba(255,107,0,0.12)",
  text:"#f0f0f4", muted:"#72727a", dim:"#44444c",
  green:"#22c55e", greenDim:"rgba(34,197,94,0.12)",
  red:"#ef4444",   redDim:"rgba(239,68,68,0.12)",
  yellow:"#eab308",yellowDim:"rgba(234,179,8,0.12)",
  blue:"#3b82f6",  blueDim:"rgba(59,130,246,0.12)",
};

const uid2 = uid;
const today = () => new Date().toISOString().slice(0,10);
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtPrice = p => "€" + Number(p).toLocaleString();

const STATUS_COLORS = {
  active:{bg:T.greenDim,text:T.green,dot:T.green},
  draft:{bg:T.yellowDim,text:T.yellow,dot:T.yellow},
  confirmed:{bg:T.greenDim,text:T.green,dot:T.green},
  pending:{bg:T.yellowDim,text:T.yellow,dot:T.yellow},
  cancelled:{bg:T.redDim,text:T.red,dot:T.red},
  available:{bg:T.greenDim,text:T.green,dot:T.green},
  "in-use":{bg:T.blueDim,text:T.blue,dot:T.blue},
  maintenance:{bg:T.yellowDim,text:T.yellow,dot:T.yellow},
  rental:{bg:T.blueDim,text:T.blue,dot:T.blue},
};

function Badge({status,text}){
  const s=STATUS_COLORS[status]||STATUS_COLORS.draft;
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:5,background:s.bg,
      color:s.text,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,
      letterSpacing:"0.04em",textTransform:"uppercase"}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:s.dot,flexShrink:0}}/>
      {text||status}
    </span>
  );
}

function Pill({children,active,onClick}){
  return(
    <button onClick={onClick} style={{background:active?T.orange:T.elevated,
      color:active?"#fff":T.muted,border:`1px solid ${active?T.orange:T.border}`,
      borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer",
      fontFamily:"inherit",transition:"all 0.15s",letterSpacing:"0.04em"}}>
      {children}
    </button>
  );
}

function Inp({label,value,onChange,type="text",placeholder,required,style:sx}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>
        {label}{required&&<span style={{color:T.orange}}> *</span>}
      </label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        style={{background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:8,
          padding:"10px 13px",color:T.text,fontSize:13,fontFamily:"inherit",
          outline:"none",width:"100%",boxSizing:"border-box",...(sx||{})}}
        onFocus={e=>e.target.style.borderColor=T.orange}
        onBlur={e=>e.target.style.borderColor=T.border}/>
    </div>
  );
}

function Sel({label,value,onChange,options,required}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>
        {label}{required&&<span style={{color:T.orange}}> *</span>}
      </label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:8,
          padding:"10px 13px",color:T.text,fontSize:13,fontFamily:"inherit",
          outline:"none",cursor:"pointer",appearance:"none",width:"100%",
          backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%23ff6b00' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E\")",
          backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center"}}
        onFocus={e=>e.target.style.borderColor=T.orange}
        onBlur={e=>e.target.style.borderColor=T.border}>
        {options.map(o=><option key={o.value} value={o.value} style={{background:T.card}}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Txt({label,value,onChange,rows=3}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</label>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows}
        style={{background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:8,
          padding:"10px 13px",color:T.text,fontSize:13,fontFamily:"inherit",
          outline:"none",resize:"vertical",width:"100%",boxSizing:"border-box",lineHeight:1.55}}
        onFocus={e=>e.target.style.borderColor=T.orange}
        onBlur={e=>e.target.style.borderColor=T.border}/>
    </div>
  );
}

function Btn({children,onClick,variant="primary",size="md",disabled}){
  const v={primary:{bg:T.orange,color:"#fff",border:T.orange},
           ghost:{bg:"transparent",color:T.muted,border:T.border},
           danger:{bg:T.redDim,color:T.red,border:T.red}}[variant];
  return(
    <button onClick={onClick} disabled={disabled}
      style={{background:v.bg,color:v.color,border:`1.5px solid ${v.border}`,
        borderRadius:8,padding:size==="sm"?"6px 12px":"9px 18px",
        fontSize:size==="sm"?11:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",
        fontFamily:"inherit",letterSpacing:"0.04em",opacity:disabled?0.5:1,transition:"opacity 0.15s"}}>
      {children}
    </button>
  );
}

function Modal({title,onClose,children,width=580}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"flex-end",
      justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <style>{`
        @media (min-width:640px) {
          .admin-modal-wrap { align-items:center !important; padding:16px !important; }
          .admin-modal-box  { border-radius:16px !important; max-height:90vh !important; }
        }
        @media (max-width:639px) {
          .admin-modal-box  { border-radius:16px 16px 0 0 !important; max-height:92vh !important; }
          .admin-modal-body { padding:16px !important; }
          .admin-form-2col  { grid-template-columns:1fr !important; }
          .admin-sidebar    { display:none !important; }
          .admin-main       { padding:16px !important; }
        }
      `}</style>
      <div className="admin-modal-wrap" style={{width:"100%",display:"flex",
        alignItems:"flex-end",justifyContent:"center",padding:"0"}}>
        <div className="admin-modal-box" style={{width:"100%",maxWidth:width,background:T.card,
          border:`1px solid ${T.border}`,borderRadius:"16px 16px 0 0",overflow:"hidden",
          maxHeight:"92vh",display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"16px 20px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
            <span style={{fontWeight:800,fontSize:16,color:T.text}}>{title}</span>
            <button onClick={onClose} style={{background:T.elevated,border:`1px solid ${T.border}`,
              color:T.muted,cursor:"pointer",fontSize:16,padding:"4px 10px",borderRadius:8,
              lineHeight:1,fontWeight:700}}>✕</button>
          </div>
          <div className="admin-modal-body" style={{padding:"20px",overflowY:"auto",flex:1}}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function Confirm({message,onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:10000,display:"flex",alignItems:"center",
      justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)"}}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,width:"90%",maxWidth:400,
        padding:"28px 32px",textAlign:"center"}}>
        <div style={{fontSize:28,marginBottom:12}}>?</div>
        <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:8}}>Are you sure?</div>
        <div style={{fontSize:13,color:T.muted,marginBottom:24}}>{message}</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="danger" onClick={onConfirm}>Delete</Btn>
        </div>
      </div>
    </div>
  );
}

function Toast({msg,type}){
  if(!msg)return null;
  const col=type==="error"?T.red:type==="warn"?T.yellow:T.green;
  return(
    <div style={{position:"fixed",bottom:28,right:28,zIndex:99999,
      background:T.elevated,border:`1.5px solid ${col}`,borderRadius:10,
      padding:"12px 18px",display:"flex",alignItems:"center",gap:10,
      boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
      <span style={{color:col,fontSize:16}}>{type==="error"?"X":type==="warn"?"!":"v"}</span>
      <span style={{fontSize:13,color:T.text,fontWeight:600}}>{msg}</span>
    </div>
  );
}

function Table({columns,rows,onEdit,onDelete,onToggleVisible}){
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead>
          <tr style={{borderBottom:`1px solid ${T.border}`}}>
            {columns.map(c=>(
              <th key={c.key} style={{padding:"10px 14px",textAlign:"left",fontSize:11,
                color:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{c.label}</th>
            ))}
            <th style={{padding:"10px 14px",textAlign:"right",fontSize:11,color:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length===0&&(
            <tr><td colSpan={columns.length+1} style={{padding:"40px 14px",textAlign:"center",color:T.dim,fontSize:13}}>No records yet.</td></tr>
          )}
          {rows.map((row,ri)=>(
            <tr key={row.id} style={{borderBottom:`1px solid ${T.border}`,
              background:ri%2===0?"transparent":"rgba(255,255,255,0.01)",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,107,0,0.04)"}
              onMouseLeave={e=>e.currentTarget.style.background=ri%2===0?"transparent":"rgba(255,255,255,0.01)"}>
              {columns.map(c=>(
                <td key={c.key} style={{padding:"12px 14px",color:T.text,whiteSpace:"nowrap"}}>
                  {c.render?c.render(row[c.key],row):<span style={{color:c.dim?T.muted:T.text}}>{row[c.key]??"—"}</span>}
                </td>
              ))}
              <td style={{padding:"12px 14px",textAlign:"right"}}>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  {onToggleVisible && (
                    <button
                      title={row.visible!==false?"Hide from public":"Show to public"}
                      onClick={()=>onToggleVisible(row)}
                      style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:7,
                        padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                        color:row.visible!==false?T.green:T.red,transition:"all 0.15s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=row.visible!==false?T.green:T.red}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                      {row.visible!==false?"👁 Visible":"🚫 Hidden"}
                    </button>
                  )}
                  <Btn variant="ghost" size="sm" onClick={()=>onEdit(row)}>Edit</Btn>
                  <Btn variant="danger" size="sm" onClick={()=>onDelete(row)}>Delete</Btn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({label,value,sub,icon,accent}){
  return(
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px 22px"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
        <div style={{fontSize:12,color:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</div>
        <div style={{fontSize:20}}>{icon}</div>
      </div>
      <div style={{fontSize:34,fontWeight:900,color:accent||T.text,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:T.muted,marginTop:6}}>{sub}</div>}
    </div>
  );
}

/* ── Routes Tab ─────────────────────────────────────────────────────────────── */
const BLANK_ROUTE = {name:"",price:"",days:1,difficulty:"Medium",status:"active",visible:true,dateType:"open",capacity:8,departures:[],stops:"",desc:"",img:""};

function RoutesTab({data,bookings,onSave,onDelete}){
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState(BLANK_ROUTE);
  const [confirmDel,setConfirmDel]=useState(null);
  const [filter,setFilter]=useState("all");
  const [imgUploading,setImgUploading]=useState(false);
  const [imgUploadErr,setImgUploadErr]=useState("");
  const routeAdminKey = import.meta.env.VITE_API_ADMIN_KEY || "";

  const handleRouteImg = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImgUploading(true);
    setImgUploadErr("");
    try {
      const result = await uploadMedia(file, routeAdminKey);
      setF("img")(result.url);
    } catch (err) {
      setImgUploadErr(err.message || "Upload failed");
    } finally {
      setImgUploading(false);
    }
  };

  const openAdd=()=>{setForm(BLANK_ROUTE);setModal("add");};
  const openEdit=r=>{setForm({...r,stops:(r.stops||[]).join(", "),img:r.img||"",visible:r.visible!==false});setModal("edit");};
  const closeModal=()=>{setModal(null);setForm(BLANK_ROUTE);};

  const setF=k=>v=>setForm(f=>({...f,[k]:v}));

  const addDep=()=>setForm(f=>({...f,departures:[...(f.departures||[]),{id:"d"+uid2(),date:"",maxSpots:8}]}));
  const updDep=(id,field,val)=>setForm(f=>({...f,departures:f.departures.map(d=>d.id===id?{...d,[field]:val}:d)}));
  const remDep=id=>setForm(f=>({...f,departures:f.departures.filter(d=>d.id!==id)}));

  const handleSave=()=>{
    if(!form.name||!form.price)return;
    const rec={...form,id:form.id||"r"+uid2(),price:Number(form.price),capacity:Number(form.capacity)||8,
      stops:form.stops.split(",").map(s=>s.trim()).filter(Boolean),
      departures:form.departures||[]};
    onSave(rec,modal==="edit");
    closeModal();
  };

  const displayed=filter==="all"?data:data.filter(r=>r.status===filter);

  const cols=[
    {key:"name",label:"Tour Name",render:v=><span style={{fontWeight:700,color:T.text}}>{v}</span>},
    {key:"price",label:"Price",render:v=><span style={{color:T.orange,fontWeight:700}}>{fmtPrice(v)}</span>},
    {key:"days",label:"Days",render:v=>`${v} day${v>1?"s":""}`},
    {key:"difficulty",label:"Level",render:v=>{const c={Easy:T.green,Medium:T.yellow,Hard:T.red}[v]||T.muted;return<span style={{color:c,fontWeight:700}}>{v}</span>;}},
    {key:"dateType",label:"Date Type",render:v=><span style={{color:T.muted,fontSize:12,textTransform:"capitalize"}}>{v}</span>},
    {key:"departures",label:"Departures",render:(v,row)=>{
      if((row.dateType||"open")==="open")return<span style={{color:T.dim,fontSize:12}}>Open dates</span>;
      const total=v||[];
      const avail=total.filter(d=>spotsLeft(d,bookings)>0).length;
      return<span style={{color:avail>0?T.green:T.muted,fontWeight:600,fontSize:12}}>{avail}/{total.length} available</span>;
    }},
    {key:"status",label:"Status",render:v=><Badge status={v}/>},
  ];

  const dateTypeOpts=[
    {value:"open",    label:"Open — rider picks any date"},
    {value:"scheduled",label:"Scheduled — predefined departure dates"},
  ];

  return(
    <>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:16,flexWrap:"wrap"}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:800,color:T.text,margin:0}}>Routes</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:T.muted}}>{data.length} total tours configured</p>
        </div>
        <Btn onClick={openAdd}>+ New Route</Btn>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {["all","active","draft"].map(f=><Pill key={f} active={filter===f} onClick={()=>setFilter(f)}>{f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}</Pill>)}
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
        <Table columns={cols} rows={displayed} onEdit={openEdit} onDelete={r=>setConfirmDel(r)} onToggleVisible={r=>{const updated={...r,visible:r.visible===false?true:false};onSave(updated,true);}}/>
      </div>

      {modal&&(
        <Modal title={modal==="add"?"New Route":"Edit Route"} onClose={closeModal} width={660}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <Inp label="Tour Name" value={form.name} onChange={setF("name")} required placeholder="e.g. 3-Day Moldova Adventure"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <Inp label="Price (EUR)" value={form.price} onChange={setF("price")} type="number" required placeholder="650"/>
              <Inp label="Days"        value={form.days}  onChange={setF("days")}  type="number" placeholder="3"/>
              <Inp label="Max Riders"  value={form.capacity} onChange={setF("capacity")} type="number" placeholder="8"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <Sel label="Difficulty" value={form.difficulty} onChange={setF("difficulty")}
                options={["Easy","Medium","Hard"].map(v=>({value:v,label:v}))}/>
              <Sel label="Status" value={form.status} onChange={setF("status")}
                options={["active","draft"].map(v=>({value:v,label:v.charAt(0).toUpperCase()+v.slice(1)}))}/>
              <Sel label="Date Type" value={form.dateType||"open"} onChange={setF("dateType")} options={dateTypeOpts}/>
            </div>

            {/* ── Tour image ─────────────────────────────────── */}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <label style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>
                Tour Image
              </label>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                {/* Preview */}
                <div style={{flexShrink:0,width:96,height:68,borderRadius:10,overflow:"hidden",
                  background:T.elevated,border:`1px solid ${T.border}`,display:"flex",
                  alignItems:"center",justifyContent:"center"}}>
                  {form.img
                    ? <img src={form.img} alt="preview"
                        style={{width:"100%",height:"100%",objectFit:"cover"}} />
                    : <span style={{fontSize:22,opacity:0.3}}>🏍️</span>
                  }
                </div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                  {/* URL input */}
                  <input type="url" value={form.img||""} onChange={e=>setF("img")(e.target.value)}
                    placeholder="https://images.unsplash.com/... or paste any image URL"
                    style={{background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:8,
                      padding:"9px 12px",color:T.text,fontSize:12,fontFamily:"inherit",
                      outline:"none",width:"100%",boxSizing:"border-box"}}
                    onFocus={e=>e.target.style.borderColor=T.orange}
                    onBlur={e=>e.target.style.borderColor=T.border}/>
                  {/* File upload → server */}
                  <label style={{
                    display:"flex",alignItems:"center",gap:8,
                    cursor:imgUploading?"not-allowed":"pointer",
                    background:imgUploading?"rgba(255,107,0,0.08)":T.elevated,
                    border:`1.5px solid ${imgUploading?T.orange:T.border}`,borderRadius:8,
                    padding:"7px 12px",fontSize:12,color:imgUploading?T.orange:T.muted,
                    userSelect:"none",transition:"all 0.15s"}}
                    onMouseEnter={e=>{if(!imgUploading)e.currentTarget.style.borderColor=T.orange;}}
                    onMouseLeave={e=>{if(!imgUploading)e.currentTarget.style.borderColor=T.border;}}>
                    {imgUploading
                      ? <><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span>
                          <span>Uploading...</span></>
                      : <><span style={{fontSize:14}}>⬆</span>
                          <span>Upload from device</span>
                          <span style={{marginLeft:"auto",fontSize:10,color:T.dim}}>JPG PNG WEBP</span></>
                    }
                    <input type="file" accept="image/*" style={{display:"none"}}
                      disabled={imgUploading} onChange={handleRouteImg}/>
                  </label>
                  {imgUploadErr && (
                    <div style={{fontSize:11,color:T.red,padding:"4px 8px",
                      background:T.redDim,borderRadius:6}}>{imgUploadErr}</div>
                  )}
                  {form.img && (
                    <button onClick={()=>setF("img")("")}
                      style={{background:"none",border:"none",color:T.dim,fontSize:11,
                        cursor:"pointer",fontFamily:"inherit",textAlign:"left",padding:0}}>
                      ✕ Remove image
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Visibility toggle */}
            <div onClick={()=>setF("visible")(form.visible===false?true:false)}
              style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",cursor:"pointer",
                background:form.visible!==false?"rgba(34,197,94,0.06)":"rgba(239,68,68,0.06)",
                border:`1.5px solid ${form.visible!==false?T.green:T.red}`,
                borderRadius:10,transition:"all 0.2s",userSelect:"none"}}>
              <div style={{width:20,height:20,borderRadius:5,flexShrink:0,
                background:form.visible!==false?T.green:T.red,
                display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
                <span style={{fontSize:11,color:"#fff"}}>{form.visible!==false?"✓":"✕"}</span>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>
                  {form.visible!==false?"Visible to customers":"Hidden from customers"}
                </div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>
                  {form.visible!==false
                    ?"This tour appears on the public site and booking modal."
                    :"Tour is saved but not shown publicly. Bookings are paused."}
                </div>
              </div>
            </div>

            <Inp label="Stops (comma-separated)" value={form.stops} onChange={setF("stops")} placeholder="Chisinau, Orheiul Vechi, Saharna"/>
            <Txt label="Description" value={form.desc} onChange={setF("desc")} rows={2}/>

            {/* ── Departure date manager ────────────────────────── */}
            {(form.dateType||"open")==="scheduled"&&(
              <div style={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <span style={{fontSize:12,color:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Departure Dates</span>
                  <Btn size="sm" onClick={addDep}>+ Add Date</Btn>
                </div>
                {(form.departures||[]).length===0&&(
                  <p style={{fontSize:13,color:T.dim,margin:0}}>No departure dates yet. Click "Add Date" to create the first one.</p>
                )}
                {(form.departures||[]).map(dep=>{
                  const booked=(bookings||[]).filter(b=>b.departureId===dep.id&&b.status==="confirmed").length;
                  return(
                    <div key={dep.id} style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
                      <input type="date" value={dep.date} onChange={e=>updDep(dep.id,"date",e.target.value)}
                        style={{flex:2,background:T.bg,border:`1px solid ${T.border}`,borderRadius:7,
                          padding:"8px 11px",color:T.text,fontSize:13,fontFamily:"inherit",outline:"none",colorScheme:"dark"}}/>
                      <input type="number" min="1" max="50" value={dep.maxSpots}
                        onChange={e=>updDep(dep.id,"maxSpots",Number(e.target.value))}
                        placeholder="Spots"
                        style={{width:72,background:T.bg,border:`1px solid ${T.border}`,borderRadius:7,
                          padding:"8px 11px",color:T.text,fontSize:13,fontFamily:"inherit",outline:"none",textAlign:"center"}}/>
                      <span style={{fontSize:12,color:booked>0?T.orange:T.dim,flexShrink:0,width:70,textAlign:"right"}}>
                        {booked} booked
                      </span>
                      <button onClick={()=>remDep(dep.id)}
                        style={{background:T.redDim,border:`1px solid ${T.red}`,color:T.red,borderRadius:7,
                          width:28,height:28,cursor:"pointer",fontFamily:"inherit",fontSize:16,flexShrink:0}}>x</button>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:4}}>
              <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={!form.name||!form.price}>
                {modal==="add"?"Create Route":"Save Changes"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {confirmDel&&(
        <Confirm message={`Delete "${confirmDel.name}"? Existing bookings will lose their tour reference.`}
          onConfirm={()=>{onDelete(confirmDel.id,"routes");setConfirmDel(null);}}
          onCancel={()=>setConfirmDel(null)}/>
      )}
    </>
  );
}

/* ── Bookings Tab ────────────────────────────────────────────────────────── */
const BLANK_BOOKING={type:"guided",tour:"",departureId:"",name:"",email:"",phone:"",country:"",
  date:today(),dateTo:"",rentalDays:1,experience:"intermediate",status:"pending",bike:"",createdAt:today()};

function BookingsTab({data,routes,fleet,onSave,onDelete}){
  /* ── State ───────────────────────────────────────────────────────────── */
  const [modal,setModal]         = useState(null);
  const [form,setForm]           = useState(BLANK_BOOKING);
  const [confirmDel,setConfirmDel] = useState(null);
  const [view,setView]           = useState("grid");   // grid | calendar | departures
  const [page,setPage]           = useState(0);
  const [rowsPerPage,setRowsPP]  = useState(10);
  const [sortField,setSortField] = useState("date");
  const [sortDir,setSortDir]     = useState("desc");
  const [filterStatus,setFS]     = useState("all");
  const [filterType,setFT]       = useState("all");
  const [filterFrom,setFF]       = useState("");
  const [filterTo,setFTo]        = useState("");
  const [search,setSearch]       = useState("");
  const [showFilters,setSF]      = useState(false);
  const [calDate,setCalDate]     = useState(new Date());
  const [detailBooking,setDetail]= useState(null);
  const [calDayOpen,setCalDayOpen]= useState(null); // "YYYY-MM-DD" of expanded day

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  const openAdd  = () => { setForm(BLANK_BOOKING); setModal("add"); };
  const openEdit = b  => { setForm(b); setModal("edit"); };
  const closeModal = () => { setModal(null); setForm(BLANK_BOOKING); };

  const handleSave = () => {
    if(!form.name||!form.email) return;
    onSave({...form, id:form.id||"b"+uid2()}, modal==="edit");
    closeModal();
  };

  const quickStatus = (id,status) => {
    const rec = data.find(b=>b.id===id);
    if(!rec) return;
    if(status==="confirmed" && rec.type!=="rental"){
      const route = (routes||[]).find(r=>r.name===rec.tour);
      if(route && route.dateType==="scheduled" && rec.departureId){
        const dep = (route.departures||[]).find(d=>d.id===rec.departureId);
        const left = dep ? spotsLeft(dep,data) : 99;
        if(left<=0 && !window.confirm("At capacity. Confirm anyway?")) return;
      }
    }
    onSave({...rec, status}, true);
  };

  const depDate = (b) => {
    const route = routes.find(r=>r.name===b.tour);
    if(!route||!b.departureId) return b.date||"—";
    const dep = (route.departures||[]).find(d=>d.id===b.departureId);
    return dep ? fmtDate(dep.date) : (b.date ? fmtDate(b.date) : "—");
  };

  const getTourPrice = (b) => {
    if(b.type==="rental") return (b.rentalDays||1) * 120;
    const r = routes.find(r=>r.name===b.tour);
    return r ? (r.price||0) : 0;
  };

  const bikeBooked = (bikeName, booking) => {
    if(!bikeName) return false;
    return data.some(b =>
      b.id !== booking.id &&
      b.bike === bikeName &&
      b.status !== "cancelled" &&
      b.date && booking.date &&
      (b.dateTo||b.date) >= booking.date &&
      b.date <= (booking.dateTo||booking.date)
    );
  };

  /* ── Status colours ───────────────────────────────────────────────────── */
  const statusStyle = (s) => ({
    confirmed: {bg:"rgba(34,197,94,0.15)",  color:"#22c55e", border:"rgba(34,197,94,0.35)"},
    pending:   {bg:"rgba(255,107,0,0.15)",  color:"#ff6b00", border:"rgba(255,107,0,0.35)"},
    cancelled: {bg:"rgba(239,68,68,0.15)",  color:"#ef4444", border:"rgba(239,68,68,0.35)"},
    completed: {bg:"rgba(59,130,246,0.15)", color:"#3b82f6", border:"rgba(59,130,246,0.35)"},
  }[s] || {bg:T.elevated, color:T.muted, border:T.border});

  /* ── Filter + sort pipeline ───────────────────────────────────────────── */
  let rows = [...data];
  if(filterStatus !== "all") rows = rows.filter(b => b.status === filterStatus);
  if(filterType   !== "all") rows = rows.filter(b => b.type === filterType);
  if(filterFrom)             rows = rows.filter(b => b.date >= filterFrom);
  if(filterTo)               rows = rows.filter(b => b.date <= filterTo);
  if(search) {
    const q = search.toLowerCase();
    rows = rows.filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.tour?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.country?.toLowerCase().includes(q) ||
      b.bike?.toLowerCase().includes(q)
    );
  }

  const sortRows = (arr) => [...arr].sort((a,b) => {
    let av, bv;
    if(sortField==="name")   { av=a.name||"";  bv=b.name||""; }
    else if(sortField==="status") { av=a.status||""; bv=b.status||""; }
    else if(sortField==="amount") { av=getTourPrice(a); bv=getTourPrice(b); }
    else { av=a.date||""; bv=b.date||""; }
    if(av<bv) return sortDir==="asc"?-1:1;
    if(av>bv) return sortDir==="asc"?1:-1;
    return 0;
  });

  rows = sortRows(rows);
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage = Math.min(page, totalPages-1);
  const pageRows = rows.slice(safePage*rowsPerPage, safePage*rowsPerPage+rowsPerPage);

  /* ── Stats ────────────────────────────────────────────────────────────── */
  const pending   = data.filter(b=>b.status==="pending").length;
  const confirmed = data.filter(b=>b.status==="confirmed").length;
  const cancelled = data.filter(b=>b.status==="cancelled").length;
  const revenue   = data.filter(b=>b.status==="confirmed"&&b.type!=="rental")
    .reduce((s,b)=>{ const r=routes.find(r=>r.name===b.tour); return s+(r?.price||0); },0);

  /* ── XLS Export ───────────────────────────────────────────────────────── */
  const exportXLS = () => {
    const cols = ["ID","Rider","Email","Country","Tour","Type","Start Date","End Date","Days","Bike","Status","Amount (EUR)"];
    const escCell = v => `"${String(v||"").replace(/"/g,'""')}"`;
    const csvRows = [cols.map(escCell).join(",")];
    data.forEach(b => {
      const price = getTourPrice(b);
      csvRows.push([
        b.id, b.name, b.email, b.country, b.tour,
        b.type==="rental"?"Free Rental":"Guided",
        b.date, b.dateTo||b.date, b.rentalDays||1,
        b.bike, b.status, price,
      ].map(escCell).join(","));
    });
    const blob = new Blob([csvRows.join("\n")], {type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "moldovamoto-bookings.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  /* ── Calendar helpers ─────────────────────────────────────────────────── */
  const calYear  = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const calLabel = calDate.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0,10);

  const bookingsOnDay = (d) => {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return data.filter(b => b.date === dateStr || (b.dateTo && b.date <= dateStr && b.dateTo >= dateStr));
  };

  /* ── Column sort handler ──────────────────────────────────────────────── */
  const sortBy = (field) => {
    if(sortField===field) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortField(field); setSortDir("asc"); }
    setPage(0);
  };

  const SortArrow = ({field}) => {
    if(sortField!==field) return <span style={{color:T.dim,marginLeft:3}}>⇅</span>;
    return <span style={{color:T.orange,marginLeft:3}}>{sortDir==="asc"?"↑":"↓"}</span>;
  };

  /* ── Form helpers ─────────────────────────────────────────────────────── */
  const setF = k => v => setForm(f=>({...f,[k]:v}));
  const tourOpts  = [{value:"",label:"Select tour…"},...routes.map(r=>({value:r.name,label:r.name})),{value:"Motorcycle Rental",label:"Motorcycle Rental (Free Riding)"}];
  const bikeOpts  = [{value:"",label:"Select bike…"},...fleet.map(f=>({value:f.name,label:`${f.name} (${f.status})`}))];
  const expOpts   = ["beginner","intermediate","advanced","expert"].map(v=>({value:v,label:v.charAt(0).toUpperCase()+v.slice(1)}));
  const statOpts  = ["pending","confirmed","cancelled","completed"].map(v=>({value:v,label:v.charAt(0).toUpperCase()+v.slice(1)}));
  const typeOpts  = [{value:"guided",label:"Guided Tour"},{value:"rental",label:"Free Riding Rental"}];
  const selectedRoute = routes.find(r=>r.name===form.tour);
  const depOpts = selectedRoute&&selectedRoute.dateType==="scheduled"
    ? [{value:"",label:"Select departure…"},...(selectedRoute.departures||[]).map(d=>({value:d.id,label:fmtDate(d.date)+` — ${d.maxSpots} spots`}))]
    : [];

  /* ── Departures summary ───────────────────────────────────────────────── */
  const departureSummary = [];
  (routes||[]).forEach(route => {
    (route.departures||[]).forEach(dep => {
      const booked  = data.filter(b=>b.departureId===dep.id&&b.status==="confirmed").length;
      const pend    = data.filter(b=>b.departureId===dep.id&&b.status==="pending").length;
      const left    = Math.max(0,(dep.maxSpots||0)-booked);
      const pct     = dep.maxSpots>0 ? Math.round(booked/dep.maxSpots*100) : 0;
      departureSummary.push({routeName:route.name,depId:dep.id,date:dep.date,
        dateLabel:fmtDate(dep.date),maxSpots:dep.maxSpots||0,booked,pending:pend,left,pct,isFull:left===0});
    });
  });
  departureSummary.sort((a,b)=>a.date.localeCompare(b.date));

  const activeFilters = filterStatus!=="all"||filterType!=="all"||filterFrom||filterTo||search;

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",
        marginBottom:20,gap:12,flexWrap:"wrap"}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:800,color:T.text,margin:0}}>Bookings</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:T.muted}}>
            {data.length} total · {pending} pending · {cancelled} cancelled
          </p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {/* View toggle */}
          <div style={{display:"flex",background:T.elevated,borderRadius:10,
            border:`1px solid ${T.border}`,overflow:"hidden"}}>
            {[["grid","⊞ Grid"],["calendar","📆 Calendar"],["departures","📅 Departures"]].map(([v,label])=>(
              <button key={v} onClick={()=>setView(v)}
                style={{padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",
                  fontFamily:"inherit",border:"none",transition:"all 0.15s",whiteSpace:"nowrap",
                  background:view===v?T.orange:"transparent",color:view===v?"#fff":T.muted}}>
                {label}
              </button>
            ))}
          </div>
          {/* Export */}
          <button onClick={exportXLS}
            style={{padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",
              fontFamily:"inherit",border:`1px solid ${T.border}`,borderRadius:10,
              background:"transparent",color:T.muted,display:"flex",alignItems:"center",gap:6}}>
            ⬇ Export CSV
          </button>
          <Btn onClick={openAdd}>+ New Booking</Btn>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <StatCard label="Pending"   value={pending}          icon="⏳" accent={T.orange}/>
        <StatCard label="Confirmed" value={confirmed}        icon="✅" accent={T.green}/>
        <StatCard label="Cancelled" value={cancelled}        icon="🚫" accent={T.red}/>
        <StatCard label="Revenue"   value={fmtPrice(revenue)} icon="€" accent={T.orange}/>
      </div>

      {/* ════ GRID VIEW ══════════════════════════════════════════════════ */}
      {view==="grid" && (
        <>
          {/* Filter / search bar */}
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,
            marginBottom:16,overflow:"hidden"}}>
            <div style={{padding:"10px 14px",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              {/* Search */}
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}
                placeholder="Search rider, tour, email, bike…"
                style={{flex:1,minWidth:160,background:T.elevated,border:`1px solid ${T.border}`,
                  borderRadius:8,padding:"7px 12px",color:T.text,fontSize:12,fontFamily:"inherit",outline:"none"}}
                onFocus={e=>e.target.style.borderColor=T.orange}
                onBlur={e=>e.target.style.borderColor=T.border}/>

              {/* Status pills */}
              <div style={{display:"flex",gap:4}}>
                {[["all","All"],["pending","Pending"],["confirmed","Confirmed"],
                  ["cancelled","Cancelled"],["completed","Completed"]].map(([v,l])=>(
                  <button key={v} onClick={()=>{setFS(v);setPage(0);}}
                    style={{padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",
                      fontFamily:"inherit",border:`1px solid ${filterStatus===v?T.orange:T.border}`,
                      borderRadius:7,background:filterStatus===v?"rgba(255,107,0,0.12)":"transparent",
                      color:filterStatus===v?T.orange:T.muted}}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Filter toggle */}
              <button onClick={()=>setSF(x=>!x)}
                style={{padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",
                  fontFamily:"inherit",border:`1px solid ${showFilters||activeFilters?T.orange:T.border}`,
                  borderRadius:7,background:activeFilters?"rgba(255,107,0,0.08)":"transparent",
                  color:activeFilters?T.orange:T.muted,display:"flex",alignItems:"center",gap:5}}>
                ⚙ Filters {activeFilters&&"•"}
              </button>

              {activeFilters&&(
                <button onClick={()=>{setFS("all");setFT("all");setFF("");setFTo("");setSearch("");setPage(0);}}
                  style={{padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",
                    fontFamily:"inherit",border:`1px solid ${T.red}`,borderRadius:7,
                    background:"rgba(239,68,68,0.08)",color:T.red}}>
                  ✕ Reset
                </button>
              )}
            </div>

            {/* Expanded filter panel */}
            {showFilters&&(
              <div style={{padding:"12px 14px",borderTop:`1px solid ${T.border}`,
                display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-end",background:T.elevated}}>
                <div>
                  <div style={{fontSize:10,color:T.dim,fontWeight:700,textTransform:"uppercase",
                    letterSpacing:"0.08em",marginBottom:5}}>Type</div>
                  <div style={{display:"flex",gap:4}}>
                    {[["all","All"],["guided","Guided"],["rental","Free Ride"]].map(([v,l])=>(
                      <button key={v} onClick={()=>{setFT(v);setPage(0);}}
                        style={{padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",
                          fontFamily:"inherit",border:`1px solid ${filterType===v?T.orange:T.border}`,
                          borderRadius:7,background:filterType===v?"rgba(255,107,0,0.1)":"transparent",
                          color:filterType===v?T.orange:T.muted}}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,color:T.dim,fontWeight:700,textTransform:"uppercase",
                    letterSpacing:"0.08em",marginBottom:5}}>Date From</div>
                  <input type="date" value={filterFrom} onChange={e=>{setFF(e.target.value);setPage(0);}}
                    style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:7,
                      padding:"5px 9px",color:T.text,fontSize:11,fontFamily:"inherit",
                      outline:"none",colorScheme:"dark"}}/>
                </div>
                <div>
                  <div style={{fontSize:10,color:T.dim,fontWeight:700,textTransform:"uppercase",
                    letterSpacing:"0.08em",marginBottom:5}}>Date To</div>
                  <input type="date" value={filterTo} onChange={e=>{setFTo(e.target.value);setPage(0);}}
                    style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:7,
                      padding:"5px 9px",color:T.text,fontSize:11,fontFamily:"inherit",
                      outline:"none",colorScheme:"dark"}}/>
                </div>
                <div>
                  <div style={{fontSize:10,color:T.dim,fontWeight:700,textTransform:"uppercase",
                    letterSpacing:"0.08em",marginBottom:5}}>Sort by</div>
                  <div style={{display:"flex",gap:4}}>
                    {[["date","Date"],["name","Name"],["status","Status"],["amount","Amount"]].map(([v,l])=>(
                      <button key={v} onClick={()=>sortBy(v)}
                        style={{padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",
                          fontFamily:"inherit",border:`1px solid ${sortField===v?T.orange:T.border}`,
                          borderRadius:7,background:sortField===v?"rgba(255,107,0,0.1)":"transparent",
                          color:sortField===v?T.orange:T.muted}}>
                        {l} {sortField===v&&(sortDir==="asc"?"↑":"↓")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:900}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${T.border}`,background:T.elevated}}>
                    {[
                      {label:"Rider / Country", field:null,       w:160},
                      {label:"Tour",            field:null,       w:160},
                      {label:"Type",            field:null,       w:90},
                      {label:"Date",            field:"date",     w:120},
                      {label:"End Date",        field:null,       w:100},
                      {label:"Bike",            field:null,       w:130},
                      {label:"Amount",          field:"amount",   w:90},
                      {label:"Status",          field:"status",   w:110},
                      {label:"Actions",         field:null,       w:120},
                    ].map(col=>(
                      <th key={col.label}
                        onClick={col.field?()=>sortBy(col.field):undefined}
                        style={{padding:"10px 12px",textAlign:"left",fontSize:10,color:T.muted,
                          fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",
                          whiteSpace:"nowrap",cursor:col.field?"pointer":"default",
                          userSelect:"none",minWidth:col.w}}>
                        {col.label}{col.field&&<SortArrow field={col.field}/>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length===0&&(
                    <tr><td colSpan={9} style={{padding:"40px",textAlign:"center",color:T.dim,fontSize:13}}>
                      No bookings match your filters.
                    </td></tr>
                  )}
                  {pageRows.map((b,i)=>{
                    const ss = statusStyle(b.status);
                    const price = getTourPrice(b);
                    const bikeConflict = bikeBooked(b.bike, b);
                    const isRental = b.type==="rental";
                    return(
                      <tr key={b.id}
                        style={{borderBottom:`1px solid ${T.border}`,cursor:"pointer",
                          background:i%2===0?"transparent":"rgba(255,255,255,0.01)",
                          transition:"background 0.12s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,107,0,0.04)"}
                        onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":"rgba(255,255,255,0.01)"}>

                        {/* Rider */}
                        <td style={{padding:"11px 12px"}}>
                          <div style={{fontWeight:700,color:T.text,fontSize:12}}>{b.name||"—"}</div>
                          <div style={{fontSize:10,color:T.dim,marginTop:1}}>{b.country||""}</div>
                        </td>

                        {/* Tour */}
                        <td style={{padding:"11px 12px",maxWidth:160}}>
                          <div style={{color:T.muted,fontSize:12,overflow:"hidden",
                            textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.tour||"—"}</div>
                        </td>

                        {/* Type */}
                        <td style={{padding:"11px 12px"}}>
                          {isRental
                            ? <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,
                                background:T.blueDim,color:T.blue}}>FREE RIDE</span>
                            : <span style={{fontSize:11,color:T.muted}}>Guided</span>}
                        </td>

                        {/* Start Date */}
                        <td style={{padding:"11px 12px",color:T.text,fontWeight:600,whiteSpace:"nowrap",fontSize:12}}>
                          {b.date ? fmtDate(b.date) : "—"}
                        </td>

                        {/* End Date */}
                        <td style={{padding:"11px 12px",color:T.muted,whiteSpace:"nowrap",fontSize:12}}>
                          {isRental && b.dateTo ? fmtDate(b.dateTo) : (isRental ? fmtDate(b.date) : "—")}
                          {isRental && b.rentalDays && (
                            <span style={{color:T.orange,marginLeft:4,fontSize:10}}>({b.rentalDays}d)</span>
                          )}
                        </td>

                        {/* Bike + availability */}
                        <td style={{padding:"11px 12px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,
                              background:!b.bike?"#555":bikeConflict?T.red:T.green}}/>
                            <span style={{color:T.muted,fontSize:12}}>{b.bike||"—"}</span>
                          </div>
                          {bikeConflict&&b.bike&&(
                            <div style={{fontSize:9,color:T.red,marginTop:1}}>Overlap detected</div>
                          )}
                        </td>

                        {/* Amount */}
                        <td style={{padding:"11px 12px",fontWeight:700,color:T.orange,fontSize:13}}>
                          {price>0 ? fmtPrice(price) : "—"}
                        </td>

                        {/* Status */}
                        <td style={{padding:"11px 12px"}}>
                          <span style={{display:"inline-flex",alignItems:"center",gap:5,
                            padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:800,
                            background:ss.bg,color:ss.color,border:`1px solid ${ss.border}`}}>
                            <span style={{width:5,height:5,borderRadius:"50%",background:ss.color,flexShrink:0}}/>
                            {(b.status||"unknown").toUpperCase()}
                          </span>
                          {b.status==="pending"&&(
                            <div style={{display:"flex",gap:3,marginTop:4}}>
                              <button onClick={e=>{e.stopPropagation();quickStatus(b.id,"confirmed");}}
                                style={{background:T.greenDim,color:T.green,border:`1px solid ${T.green}`,
                                  borderRadius:4,padding:"2px 6px",fontSize:9,fontWeight:700,
                                  cursor:"pointer",fontFamily:"inherit"}}>✓ OK</button>
                              <button onClick={e=>{e.stopPropagation();quickStatus(b.id,"cancelled");}}
                                style={{background:T.redDim,color:T.red,border:`1px solid ${T.red}`,
                                  borderRadius:4,padding:"2px 6px",fontSize:9,fontWeight:700,
                                  cursor:"pointer",fontFamily:"inherit"}}>✕</button>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{padding:"11px 12px"}}>
                          <div style={{display:"flex",gap:6}}>
                            <Btn variant="ghost" size="sm" onClick={e=>{e.stopPropagation();openEdit(b);}}>Edit</Btn>
                            <Btn variant="danger" size="sm" onClick={e=>{e.stopPropagation();setConfirmDel(b);}}>Del</Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"8px 4px",flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:12,color:T.muted}}>
              {totalRows===0?"No results":`Showing ${safePage*rowsPerPage+1}–${Math.min((safePage+1)*rowsPerPage,totalRows)} of ${totalRows} bookings`}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:11,color:T.dim}}>Rows per page</span>
              <select value={rowsPerPage} onChange={e=>{setRowsPP(Number(e.target.value));setPage(0);}}
                style={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:7,
                  padding:"4px 8px",color:T.text,fontSize:11,fontFamily:"inherit",outline:"none"}}>
                {[10,25,50,100].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
              <div style={{display:"flex",gap:4}}>
                <button disabled={safePage===0} onClick={()=>setPage(0)}
                  style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${T.border}`,
                    background:"transparent",color:safePage===0?T.dim:T.muted,cursor:safePage===0?"not-allowed":"pointer",fontSize:12}}>
                  «
                </button>
                <button disabled={safePage===0} onClick={()=>setPage(p=>p-1)}
                  style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${T.border}`,
                    background:"transparent",color:safePage===0?T.dim:T.muted,cursor:safePage===0?"not-allowed":"pointer",fontSize:12}}>
                  ‹
                </button>
                {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
                  const pg = Math.max(0, Math.min(totalPages-5, safePage-2)) + i;
                  return(
                    <button key={pg} onClick={()=>setPage(pg)}
                      style={{padding:"4px 10px",borderRadius:6,fontSize:12,cursor:"pointer",
                        border:`1px solid ${pg===safePage?T.orange:T.border}`,
                        background:pg===safePage?"rgba(255,107,0,0.12)":"transparent",
                        color:pg===safePage?T.orange:T.muted}}>
                      {pg+1}
                    </button>
                  );
                })}
                <button disabled={safePage>=totalPages-1} onClick={()=>setPage(p=>p+1)}
                  style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${T.border}`,
                    background:"transparent",color:safePage>=totalPages-1?T.dim:T.muted,
                    cursor:safePage>=totalPages-1?"not-allowed":"pointer",fontSize:12}}>
                  ›
                </button>
                <button disabled={safePage>=totalPages-1} onClick={()=>setPage(totalPages-1)}
                  style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${T.border}`,
                    background:"transparent",color:safePage>=totalPages-1?T.dim:T.muted,
                    cursor:safePage>=totalPages-1?"not-allowed":"pointer",fontSize:12}}>
                  »
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════ CALENDAR VIEW ══════════════════════════════════════════════ */}
      {view==="calendar" && (
        <div>
          {/* Calendar nav */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            marginBottom:16,background:T.card,border:`1px solid ${T.border}`,
            borderRadius:12,padding:"12px 18px"}}>
            <button onClick={()=>setCalDate(d=>new Date(d.getFullYear(),d.getMonth()-1,1))}
              style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,
                padding:"6px 14px",color:T.muted,cursor:"pointer",fontSize:14,fontWeight:700}}>‹</button>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontWeight:800,fontSize:16,color:T.text}}>{calLabel}</span>
              <button onClick={()=>setCalDate(new Date())}
                style={{background:T.orangeDim,border:`1px solid rgba(255,107,0,0.3)`,
                  borderRadius:6,padding:"4px 10px",color:T.orange,cursor:"pointer",
                  fontSize:11,fontWeight:700}}>Today</button>
            </div>
            <button onClick={()=>setCalDate(d=>new Date(d.getFullYear(),d.getMonth()+1,1))}
              style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,
                padding:"6px 14px",color:T.muted,cursor:"pointer",fontSize:14,fontWeight:700}}>›</button>
          </div>

          {/* Day-of-week headers */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
              <div key={d} style={{textAlign:"center",fontSize:10,fontWeight:800,
                color:T.dim,padding:"6px 0",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
            {/* Empty cells for first week */}
            {Array.from({length:((firstDay+6)%7)},(_,i)=>(
              <div key={"e"+i} style={{minHeight:90,borderRadius:8,background:"transparent"}}/>
            ))}
            {/* Day cells */}
            {Array.from({length:daysInMonth},(_,i)=>{
              const d = i+1;
              const dateStr = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
              const dayBookings = bookingsOnDay(d);
              const isToday = dateStr===todayStr;
              return(
                <div key={d} style={{minHeight:90,borderRadius:8,padding:"6px 7px",
                  background:isToday?"rgba(255,107,0,0.07)":T.card,
                  border:`1px solid ${isToday?T.orange:T.border}`,
                  transition:"border-color 0.15s"}}>
                  <div style={{fontSize:11,fontWeight:isToday?800:500,
                    color:isToday?T.orange:T.muted,marginBottom:4}}>{d}</div>
                  {dayBookings.slice(0,3).map(b=>{
                    const ss = statusStyle(b.status);
                    return(
                      <div key={b.id} onClick={()=>setDetail(b)}
                        title={`${b.name} — ${b.tour}`}
                        style={{fontSize:9,fontWeight:700,padding:"2px 5px",borderRadius:4,
                          marginBottom:2,cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis",
                          whiteSpace:"nowrap",background:ss.bg,color:ss.color,
                          border:`1px solid ${ss.border}`}}>
                        {b.name?.split(" ")[0]}
                      </div>
                    );
                  })}
                  {dayBookings.length>3&&(
                    <div onClick={e=>{e.stopPropagation();setCalDayOpen(dateStr);}}
                      style={{fontSize:9,color:T.orange,fontWeight:700,cursor:"pointer",
                        padding:"2px 5px",borderRadius:4,marginTop:1,
                        background:"rgba(255,107,0,0.12)",border:"1px solid rgba(255,107,0,0.25)",
                        display:"inline-block"}}>
                      +{dayBookings.length-3} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day expand modal — shows all bookings on a day */}
          {calDayOpen&&(()=>{
            const expandDate = calDayOpen;
            const dayBks = data.filter(b =>
              b.date===expandDate ||
              (b.dateTo && b.date<=expandDate && b.dateTo>=expandDate)
            );
            const dayLabel = new Date(expandDate+"T12:00:00").toLocaleDateString("en-GB",{
              weekday:"long",day:"2-digit",month:"long",year:"numeric"
            });
            return(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",
                zIndex:2100,display:"flex",alignItems:"center",justifyContent:"center"}}
                onClick={()=>setCalDayOpen(null)}>
                <div onClick={e=>e.stopPropagation()}
                  style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,
                    padding:20,maxWidth:480,width:"94vw",maxHeight:"88vh",overflowY:"auto"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div>
                      <h3 style={{margin:0,fontSize:15,fontWeight:800,color:T.text}}>{dayLabel}</h3>
                      <p style={{margin:"3px 0 0",fontSize:12,color:T.muted}}>{dayBks.length} booking{dayBks.length!==1?"s":""}</p>
                    </div>
                    <button onClick={()=>setCalDayOpen(null)}
                      style={{background:"transparent",border:"none",color:T.muted,cursor:"pointer",fontSize:20,lineHeight:1}}>✕</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {dayBks.map(b=>{
                      const ss=statusStyle(b.status);
                      return(
                        <div key={b.id}
                          onClick={()=>{setCalDayOpen(null);setDetail(b);}}
                          style={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:10,
                            padding:"12px 14px",cursor:"pointer",transition:"border-color 0.15s"}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor=T.orange}
                          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                            <div>
                              <div style={{fontWeight:700,fontSize:13,color:T.text}}>{b.name}</div>
                              <div style={{fontSize:11,color:T.muted,marginTop:2}}>{b.tour}</div>
                              {b.bike&&<div style={{fontSize:10,color:T.dim,marginTop:1}}>{b.bike}</div>}
                            </div>
                            <span style={{fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:5,
                              background:ss.bg,color:ss.color,border:`1px solid ${ss.border}`,flexShrink:0}}>
                              {(b.status||"").toUpperCase()}
                            </span>
                          </div>
                          {(b.dateTo&&b.date!==b.dateTo)&&(
                            <div style={{fontSize:10,color:T.orange,marginTop:4}}>
                              {fmtDate(b.date)} → {fmtDate(b.dateTo)} ({b.rentalDays||1}d)
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Booking detail panel */}
          {detailBooking&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",
              zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center"}}
              onClick={()=>setDetail(null)}>
              <div onClick={e=>e.stopPropagation()}
                style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,
                  padding:18,maxWidth:440,width:"94vw"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
                  <h3 style={{margin:0,fontSize:16,fontWeight:800,color:T.text}}>{detailBooking.name}</h3>
                  <button onClick={()=>setDetail(null)}
                    style={{background:"transparent",border:"none",color:T.muted,cursor:"pointer",fontSize:18}}>✕</button>
                </div>
                {[
                  ["Tour",     detailBooking.tour],
                  ["Type",     detailBooking.type==="rental"?"Free Rental":"Guided"],
                  ["Date",     fmtDate(detailBooking.date)],
                  ["End Date", detailBooking.dateTo?fmtDate(detailBooking.dateTo):"—"],
                  ["Bike",     detailBooking.bike||"—"],
                  ["Country",  detailBooking.country||"—"],
                  ["Email",    detailBooking.email||"—"],
                  ["Phone",    detailBooking.phone||"—"],
                  ["Amount",   fmtPrice(getTourPrice(detailBooking))],
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",
                    borderBottom:`1px solid ${T.border}`,fontSize:13}}>
                    <span style={{color:T.muted}}>{k}</span>
                    <span style={{color:T.text,fontWeight:600}}>{v}</span>
                  </div>
                ))}
                <div style={{marginTop:16,display:"flex",gap:8}}>
                  <Btn onClick={()=>{openEdit(detailBooking);setDetail(null);}}>Edit</Btn>
                  {detailBooking.status==="pending"&&(
                    <Btn onClick={()=>{quickStatus(detailBooking.id,"confirmed");setDetail(null);}}>
                      Confirm
                    </Btn>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════ DEPARTURES VIEW ════════════════════════════════════════════ */}
      {view==="departures" && (
        <div>
          {departureSummary.length===0 ? (
            <div style={{textAlign:"center",padding:"60px 0",color:T.dim}}>
              <div style={{fontSize:40,marginBottom:12}}>📅</div>
              <div style={{fontSize:14,color:T.muted}}>No scheduled departures yet. Add departure dates in the Routes tab.</div>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {departureSummary.map((dep,i)=>{
                const barColor = dep.isFull ? T.red : dep.pct>=80 ? T.yellow : T.green;
                const riders   = data.filter(b => b.departureId===dep.depId && b.status==="confirmed");
                return(
                  <div key={i} style={{background:T.card,border:`1px solid ${dep.isFull?T.red:T.border}`,
                    borderRadius:14,padding:"18px 20px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",
                      marginBottom:12,gap:12,flexWrap:"wrap"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                          <span style={{fontWeight:800,fontSize:15,color:T.text}}>{dep.routeName}</span>
                          <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:5,
                            background:dep.isFull?"rgba(239,68,68,0.12)":dep.pct>=80?"rgba(234,179,8,0.12)":"rgba(34,197,94,0.1)",
                            color:dep.isFull?T.red:dep.pct>=80?T.yellow:T.green}}>
                            {dep.isFull?"FULL":dep.pct>=80?"Filling fast":"Open"}
                          </span>
                        </div>
                        <div style={{fontSize:13,color:T.muted}}>📅 {dep.dateLabel}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:26,fontWeight:900,color:dep.isFull?T.red:T.orange,lineHeight:1}}>
                          {dep.booked}<span style={{fontSize:14,color:T.muted,fontWeight:400}}>/{dep.maxSpots}</span>
                        </div>
                        <div style={{fontSize:11,color:T.muted,marginTop:2}}>
                          {dep.left} spot{dep.left!==1?"s":""} left
                          {dep.pending>0&&<span style={{color:T.yellow,marginLeft:6}}>· {dep.pending} pending</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{height:8,background:T.elevated,borderRadius:4,overflow:"hidden",marginBottom:12}}>
                      <div style={{height:"100%",width:dep.pct+"%",background:barColor,borderRadius:4,transition:"width 0.5s ease"}}/>
                    </div>
                    {riders.length>0 ? (
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {riders.map((r,j)=>(
                          <span key={j} style={{background:T.elevated,border:`1px solid ${T.border}`,
                            borderRadius:6,padding:"3px 10px",fontSize:11,color:T.text,
                            display:"flex",alignItems:"center",gap:5}}>
                            <span style={{width:18,height:18,borderRadius:"50%",background:"rgba(255,107,0,0.15)",
                              display:"inline-flex",alignItems:"center",justifyContent:"center",
                              fontSize:9,fontWeight:800,color:T.orange,flexShrink:0}}>
                              {(r.name||"?")[0].toUpperCase()}
                            </span>
                            {r.name}
                            {r.country&&<span style={{color:T.dim}}>· {r.country}</span>}
                          </span>
                        ))}
                        {Array.from({length:dep.left}).map((_,j)=>(
                          <span key={"e"+j} style={{background:"transparent",border:`1px dashed ${T.border}`,
                            borderRadius:6,padding:"3px 10px",fontSize:11,color:T.dim}}>
                            Open seat
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{fontSize:12,color:T.dim,fontStyle:"italic"}}>No confirmed riders yet</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Add/Edit modal ─────────────────────────────────────────────── */}
      {modal&&(
        <Modal title={modal==="add"?"New Booking":"Edit Booking"} onClose={closeModal}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="admin-form-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Sel label="Type"   value={form.type||"guided"} onChange={setF("type")} options={typeOpts}/>
              <Sel label="Status" value={form.status}         onChange={setF("status")} options={statOpts}/>
            </div>
            <Sel label="Tour" value={form.tour} onChange={v=>{setF("tour")(v);setF("departureId")("");}} options={tourOpts} required/>
            {depOpts.length>0&&(
              <Sel label="Departure Date" value={form.departureId||""} onChange={setF("departureId")} options={depOpts}/>
            )}
            {(!selectedRoute||selectedRoute.dateType==="open")&&(
              <Inp label="From Date" value={form.date||""} onChange={setF("date")} type="date"/>
            )}
            {(form.type==="rental"||!form.tour)&&(
              <Inp label="To Date" value={form.dateTo||""} onChange={v=>{setF("dateTo")(v);const ms=new Date(v)-new Date(form.date);if(ms>0)setF("rentalDays")(Math.round(ms/86400000));}} type="date"/>
            )}
            <div className="admin-form-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Inp label="Rider Name" value={form.name}    onChange={setF("name")}    required placeholder="Full name"/>
              <Inp label="Country"    value={form.country} onChange={setF("country")} placeholder="Germany"/>
            </div>
            <div className="admin-form-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Inp label="Email" value={form.email} onChange={setF("email")} type="email" required placeholder="rider@mail.com"/>
              <Inp label="Phone" value={form.phone} onChange={setF("phone")} placeholder="+49 ..."/>
            </div>
            <div className="admin-form-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Sel label="Experience" value={form.experience} onChange={setF("experience")} options={expOpts}/>
              <Sel label="Assign Bike" value={form.bike||""} onChange={setF("bike")} options={bikeOpts}/>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:4}}>
              <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={!form.name||!form.email}>{modal==="add"?"Create":"Save Changes"}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {confirmDel&&(
        <Confirm message={`Delete booking for "${confirmDel.name}"?`}
          onConfirm={()=>{onDelete(confirmDel.id,"bookings");setConfirmDel(null);}}
          onCancel={()=>setConfirmDel(null)}/>
      )}
    </>
  );
}


/* ── Fleet Tab ───────────────────────────────────────────────────────────── */
const BLANK_BIKE={name:"",model:"CFMOTO 800MT Adventure",year:2024,status:"available",odometer:"",lastService:today(),color:"Storm Black",features:"ABS, Traction Control, Heated Grips, Cruise Control"};

function FleetTab({data,onSave,onDelete}){
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState(BLANK_BIKE);
  const [confirmDel,setConfirmDel]=useState(null);

  const openAdd=()=>{setForm(BLANK_BIKE);setModal("add");};
  const openEdit=b=>{setForm({...b,features:(b.features||[]).join(", ")});setModal("edit");};
  const closeModal=()=>{setModal(null);setForm(BLANK_BIKE);};

  const handleSave=()=>{
    if(!form.name)return;
    onSave({...form,id:form.id||"f"+uid2(),odometer:Number(form.odometer)||0,
      features:form.features.split(",").map(s=>s.trim()).filter(Boolean)},modal==="edit");
    closeModal();
  };

  const cols=[
    {key:"name",       label:"Name",     render:v=><span style={{fontWeight:700,color:T.text}}>{v}</span>},
    {key:"model",      label:"Model",    render:v=><span style={{color:T.muted,fontSize:12}}>{v}</span>},
    {key:"year",       label:"Year"},
    {key:"color",      label:"Color",    render:v=><span style={{color:T.muted}}>{v}</span>},
    {key:"odometer",   label:"Odometer", render:v=><span style={{fontWeight:600}}>{Number(v||0).toLocaleString()} km</span>},
    {key:"lastService",label:"Last Svc", render:v=><span style={{color:T.muted}}>{fmtDate(v)}</span>},
    {key:"status",     label:"Status",   render:v=><Badge status={v}/>},
  ];

  const setF=k=>v=>setForm(f=>({...f,[k]:v}));
  const statusOpts=["available","in-use","maintenance"].map(v=>({value:v,label:v.replace("-"," ").replace(/\b\w/g,c=>c.toUpperCase())}));
  const available=data.filter(b=>b.status==="available").length;
  const inUse=data.filter(b=>b.status==="in-use").length;
  const maint=data.filter(b=>b.status==="maintenance").length;

  return(
    <>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:16,flexWrap:"wrap"}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:800,color:T.text,margin:0}}>Fleet</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:T.muted}}>{data.length} motorcycles total</p>
        </div>
        <Btn onClick={openAdd}>+ Add Bike</Btn>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
        <StatCard label="Available"   value={available} icon="🏍️" accent={T.green}/>
        <StatCard label="In Use"      value={inUse}     icon="🛣️" accent={T.blue}/>
        <StatCard label="Maintenance" value={maint}     icon="🔧" accent={T.yellow}/>
      </div>

      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",marginBottom:20}}>
        <Table columns={cols} rows={data} onEdit={openEdit} onDelete={r=>setConfirmDel(r)}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:16}}>
        {data.map(bike=>(
          <div key={bike.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"18px 20px"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
              <div>
                <div style={{fontWeight:800,fontSize:14,color:T.text}}>{bike.name}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>{bike.color} · {bike.year}</div>
              </div>
              <Badge status={bike.status}/>
            </div>
            <div style={{fontSize:12,color:T.muted,marginBottom:10}}>{Number(bike.odometer||0).toLocaleString()} km · Svc: {fmtDate(bike.lastService)}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {(bike.features||[]).slice(0,3).map(f=>(
                <span key={f} style={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:5,padding:"2px 7px",fontSize:10,color:T.muted}}>{f}</span>
              ))}
              {(bike.features||[]).length>3&&<span style={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:5,padding:"2px 7px",fontSize:10,color:T.dim}}>+{bike.features.length-3}</span>}
            </div>
          </div>
        ))}
      </div>

      {modal&&(
        <Modal title={modal==="add"?"Add Motorcycle":"Edit Motorcycle"} onClose={closeModal}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Inp label="Display Name" value={form.name}  onChange={setF("name")}  required placeholder="CFMOTO 800MT #5"/>
              <Inp label="Model"        value={form.model} onChange={setF("model")} placeholder="CFMOTO 800MT Adventure"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <Inp label="Year"   value={form.year}   onChange={setF("year")}  type="number" placeholder="2024"/>
              <Inp label="Color"  value={form.color}  onChange={setF("color")} placeholder="Storm Black"/>
              <Sel label="Status" value={form.status} onChange={setF("status")} options={statusOpts}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Inp label="Odometer (km)"  value={form.odometer}    onChange={setF("odometer")}    type="number" placeholder="0"/>
              <Inp label="Last Service"   value={form.lastService} onChange={setF("lastService")} type="date"/>
            </div>
            <Inp label="Features (comma-separated)" value={form.features} onChange={setF("features")} placeholder="ABS, Traction Control, Heated Grips"/>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:4}}>
              <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={!form.name}>{modal==="add"?"Add to Fleet":"Save Changes"}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {confirmDel&&(
        <Confirm message={`Remove "${confirmDel.name}" from the fleet?`}
          onConfirm={()=>{onDelete(confirmDel.id,"fleet");setConfirmDel(null);}}
          onCancel={()=>setConfirmDel(null)}/>
      )}
    </>
  );
}

/* ── Dashboard ───────────────────────────────────────────────────────────── */
function DashboardTab({routes,bookings,fleet}){
  const [depType,  setDepType]  = useState("all");   // all | guided | rental
  const [depStatus,setDepStatus]= useState("all");   // all | pending | confirmed
  const [depBike,  setDepBike]  = useState("all");   // all | bike name
  const [depFrom,  setDepFrom]  = useState("");       // date string
  const [depTo,    setDepTo]    = useState("");       // date string
  const [depSort,  setDepSort]  = useState("asc");   // asc | desc

  // Find bikes currently on rental or upcoming rental
  const today2 = new Date().toISOString().slice(0,10);
  const bikeRentalStatus = (fleet||[]).reduce((acc,f)=>{
    const rental = (bookings||[]).find(b =>
      b.bike===f.name && b.type==="rental" && b.status==="confirmed" &&
      b.date && b.dateTo && b.date<=today2 && b.dateTo>=today2
    );
    const upcoming = (bookings||[]).find(b =>
      b.bike===f.name && b.type==="rental" && b.status==="confirmed" &&
      b.date && b.date>today2
    );
    acc[f.id] = rental ? {label:"On rental",color:T.yellow,sub:rental.date+"→"+rental.dateTo}
               : upcoming ? {label:"Booked "+fmtDate(upcoming.date),color:T.blue,sub:"→"+fmtDate(upcoming.dateTo||"")}
               : null;
    return acc;
  },{});
  const pending=bookings.filter(b=>b.status==="pending").length;
  const confirmed=bookings.filter(b=>b.status==="confirmed").length;
  const revenue=bookings.filter(b=>b.status==="confirmed"&&b.type!=="rental").reduce((s,b)=>{
    const r=routes.find(r=>r.name===b.tour);return s+(r?.price||0);
  },0);
  const available=fleet.filter(f=>f.status==="available").length;
  const recent=[...bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);

  return(
    <>
      <div style={{marginBottom:28}}>
        <h2 style={{fontSize:20,fontWeight:800,color:T.text,margin:"0 0 4px"}}>Dashboard</h2>
        <p style={{fontSize:13,color:T.muted,margin:0}}>Live overview of MoldovaMoto operations.</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
        <StatCard label="Active Routes"    value={routes.filter(r=>r.status==="active").length} icon="🗺️" accent={T.orange}/>
        <StatCard label="Pending"          value={pending}      icon="⏳" accent={T.yellow} sub="Awaiting confirmation"/>
        <StatCard label="Revenue"          value={fmtPrice(revenue)} icon="€" accent={T.green} sub={`${confirmed} confirmed`}/>
        <StatCard label="Bikes Available"  value={`${available}/${fleet.length}`} icon="🏍️" accent={T.blue}/>
      </div>

      {/* Tour occupancy */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px 22px"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:16}}>Tour Occupancy</div>
          {routes.filter(r=>r.status==="active").map(route=>{
            const deps=route.departures||[];
            const totalSpots=deps.reduce((s,d)=>s+(d.maxSpots||0),0);
            const usedSpots=bookings.filter(b=>b.tour===route.name&&b.status==="confirmed").length;
            const pct=totalSpots>0?Math.round((usedSpots/totalSpots)*100):0;
            return(
              <div key={route.id} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:T.muted,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{route.name}</span>
                  <span style={{fontSize:12,fontWeight:700,color:T.orange}}>{usedSpots}/{totalSpots} riders</span>
                </div>
                <div style={{background:T.elevated,borderRadius:4,height:6,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:T.orange,borderRadius:4,transition:"width 0.5s ease"}}/>
                </div>
                {route.dateType==="scheduled"&&(
                  <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                    {deps.slice(0,4).map(dep=>{
                      const left=spotsLeft(dep,bookings);
                      const col=left===0?T.red:left<=2?T.yellow:T.green;
                      return(
                        <span key={dep.id} style={{fontSize:10,background:T.elevated,border:`1px solid ${T.border}`,
                          borderRadius:5,padding:"2px 7px",color:col,fontWeight:600}}>
                          {new Date(dep.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})} · {left} left
                        </span>
                      );
                    })}
                    {deps.length>4&&<span style={{fontSize:10,color:T.dim}}>+{deps.length-4} more</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px 22px"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:16}}>Fleet Status</div>
          {fleet.map(b=>(
            <div key={b.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>{b.name}</div>
                <div style={{fontSize:11,color:T.dim}}>{Number(b.odometer||0).toLocaleString()} km</div>
              </div>
              <Badge status={b.status}/>
            </div>
          ))}
        </div>
      </div>


      {/* Upcoming Departures */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",marginBottom:20}}>

        {/* Header */}
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <span style={{fontSize:13,fontWeight:700,color:T.text}}>Upcoming Departures</span>
          <span style={{fontSize:11,color:T.muted}}>Guided tours + free rides starting from today</span>
        </div>

        {/* Filter + sort bar */}
        {(()=>{
          const bikeNames = [...new Set((bookings||[]).filter(b=>b.bike).map(b=>b.bike))].sort();
          const selStyle = (active) => ({
            padding:"5px 11px", fontSize:11, fontWeight:700, cursor:"pointer",
            fontFamily:"inherit", border:`1px solid ${active?T.orange:T.border}`,
            borderRadius:7, background:active?"rgba(255,107,0,0.1)":"transparent",
            color:active?T.orange:T.muted, transition:"all 0.15s"
          });
          const inputStyle = {
            background:T.elevated, border:`1px solid ${T.border}`, borderRadius:7,
            padding:"5px 9px", color:T.text, fontSize:11, fontFamily:"inherit",
            outline:"none", colorScheme:"dark"
          };
          return(
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,
              display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>

              {/* Type filter */}
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <span style={{fontSize:10,color:T.dim,fontWeight:700,marginRight:2,textTransform:"uppercase",letterSpacing:"0.08em"}}>Type</span>
                {[["all","All"],["guided","Guided"],["rental","Free Ride"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setDepType(v)} style={selStyle(depType===v)}>{l}</button>
                ))}
              </div>

              <div style={{width:1,height:20,background:T.border}}/>

              {/* Status filter */}
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <span style={{fontSize:10,color:T.dim,fontWeight:700,marginRight:2,textTransform:"uppercase",letterSpacing:"0.08em"}}>Status</span>
                {[["all","All"],["pending","Pending"],["confirmed","Confirmed"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setDepStatus(v)} style={selStyle(depStatus===v)}>{l}</button>
                ))}
              </div>

              <div style={{width:1,height:20,background:T.border}}/>

              {/* Bike filter */}
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <span style={{fontSize:10,color:T.dim,fontWeight:700,marginRight:2,textTransform:"uppercase",letterSpacing:"0.08em"}}>Bike</span>
                <select value={depBike} onChange={e=>setDepBike(e.target.value)} style={inputStyle}>
                  <option value="all">All bikes</option>
                  {bikeNames.map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div style={{width:1,height:20,background:T.border}}/>

              {/* Date range */}
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:10,color:T.dim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>From</span>
                <input type="date" value={depFrom} onChange={e=>setDepFrom(e.target.value)} style={inputStyle}/>
                <span style={{fontSize:10,color:T.dim,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>To</span>
                <input type="date" value={depTo} onChange={e=>setDepTo(e.target.value)} style={inputStyle}/>
              </div>

              <div style={{width:1,height:20,background:T.border}}/>

              {/* Sort */}
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <span style={{fontSize:10,color:T.dim,fontWeight:700,marginRight:2,textTransform:"uppercase",letterSpacing:"0.08em"}}>Sort</span>
                <button onClick={()=>setDepSort("asc")}  style={selStyle(depSort==="asc")}>↑ Earliest</button>
                <button onClick={()=>setDepSort("desc")} style={selStyle(depSort==="desc")}>↓ Latest</button>
              </div>

              {/* Reset */}
              {(depType!=="all"||depStatus!=="all"||depBike!=="all"||depFrom||depTo)&&(
                <button onClick={()=>{setDepType("all");setDepStatus("all");setDepBike("all");setDepFrom("");setDepTo("");}}
                  style={{marginLeft:"auto",padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",
                    fontFamily:"inherit",border:`1px solid ${T.red}`,borderRadius:7,
                    background:"rgba(239,68,68,0.08)",color:T.red}}>
                  ✕ Reset
                </button>
              )}
            </div>
          );
        })()}

        {/* Table */}
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${T.border}`}}>
              {["Rider / Tour","Date","Type","Bike","Spots Left","Status"].map(h=>(
                <th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(()=>{
              const todayS = new Date().toISOString().slice(0,10);
              let rows = [];

              // Guided tour departures
              (routes||[]).forEach(route=>{
                if(route.dateType!=="scheduled") return;
                (route.departures||[]).filter(d=>d.date>=todayS).forEach(dep=>{
                  const booked=(bookings||[]).filter(b=>b.departureId===dep.id&&b.status==="confirmed").length;
                  const left=Math.max(0,(dep.maxSpots||0)-booked);
                  rows.push({kind:"guided",rName:route.name,date:dep.date,dateTo:null,dep,booked,left,booking:null,bike:"Fleet",rowStatus:left===0?"full":left<=2?"filling":"open"});
                });
              });

              // Free rental bookings
              (bookings||[])
                .filter(b=>b.type==="rental"&&b.date&&b.date>=todayS&&b.status!=="cancelled")
                .forEach(b=>{
                  rows.push({kind:"rental",rName:b.name||"Free Ride",date:b.date,dateTo:b.dateTo||null,dep:null,booked:1,left:null,booking:b,bike:b.bike||"—",rowStatus:b.status});
                });

              // ── Apply filters ───────────────────────────────────────
              if(depType!=="all")   rows=rows.filter(r=>r.kind===depType);
              if(depStatus!=="all") rows=rows.filter(r=>{
                if(r.kind==="rental") return r.booking.status===depStatus;
                if(depStatus==="confirmed") return r.left<r.dep?.maxSpots;
                return true;
              });
              if(depBike!=="all")   rows=rows.filter(r=>r.bike===depBike);
              if(depFrom)           rows=rows.filter(r=>r.date>=depFrom);
              if(depTo)             rows=rows.filter(r=>r.date<=depTo);

              // ── Sort ────────────────────────────────────────────────
              rows.sort((a,b)=>depSort==="asc"?a.date.localeCompare(b.date):b.date.localeCompare(a.date));

              if(rows.length===0) return(
                <tr><td colSpan={6} style={{padding:"32px 16px",textAlign:"center",color:T.dim}}>
                  No entries match your filters.
                </td></tr>
              );

              return rows.map((row,i)=>{
                if(row.kind==="rental"){
                  const b=row.booking;
                  return(
                    <tr key={"r"+b.id} style={{borderBottom:`1px solid ${T.border}`,background:"rgba(59,130,246,0.03)"}}>
                      <td style={{padding:"10px 14px"}}>
                        <div style={{fontWeight:700,color:T.text,fontSize:12}}>{b.name}</div>
                        <div style={{fontSize:11,color:T.muted}}>Free Motorcycle Rental</div>
                      </td>
                      <td style={{padding:"10px 14px",color:T.text,whiteSpace:"nowrap",fontSize:12}}>
                        {fmtDate(b.date)}
                        {b.dateTo&&<><span style={{color:T.muted}}> → </span>{fmtDate(b.dateTo)}</>}
                        {b.rentalDays&&<span style={{color:T.orange,marginLeft:5,fontSize:11}}>({b.rentalDays}d)</span>}
                      </td>
                      <td style={{padding:"10px 14px"}}><Badge status="rental" text="Free Ride"/></td>
                      <td style={{padding:"10px 14px",color:T.muted,fontSize:12}}>{b.bike||"—"}</td>
                      <td style={{padding:"10px 14px",color:T.muted,fontSize:12}}>—</td>
                      <td style={{padding:"10px 14px"}}><Badge status={b.status}/></td>
                    </tr>
                  );
                }
                const {rName,dep,booked,left}=row;
                return(
                  <tr key={dep.id} style={{borderBottom:`1px solid ${T.border}`}}>
                    <td style={{padding:"10px 14px",color:T.text,fontWeight:600,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{rName}</td>
                    <td style={{padding:"10px 14px",color:T.text,whiteSpace:"nowrap"}}>{fmtDate(dep.date)}</td>
                    <td style={{padding:"10px 14px"}}><span style={{fontSize:11,color:T.dim}}>Guided</span></td>
                    <td style={{padding:"10px 14px",color:T.muted,fontSize:12}}>Fleet</td>
                    <td style={{padding:"10px 14px",fontWeight:700,color:left===0?T.red:left<=2?T.yellow:T.green}}>{left} / {dep.maxSpots}</td>
                    <td style={{padding:"10px 14px"}}>
                      <Badge status={left===0?"full":left<=2?"filling":"available"}
                        text={left===0?"FULL":left<=2?"Filling":"Open"}/>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:13,fontWeight:700,color:T.text}}>Recent Bookings</span>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${T.border}`}}>
              {["Rider","Tour","Type","Date","Status"].map(h=>(
                <th key={h} style={{padding:"9px 16px",textAlign:"left",fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map(b=>(
              <tr key={b.id} style={{borderBottom:`1px solid ${T.border}`}}>
                <td style={{padding:"11px 16px",fontWeight:700,color:T.text}}>{b.name}</td>
                <td style={{padding:"11px 16px",color:T.muted,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.tour}</td>
                <td style={{padding:"11px 16px"}}>{b.type==="rental"?<Badge status="rental" text="Rental"/>:<span style={{fontSize:11,color:T.dim}}>Guided</span>}</td>
                <td style={{padding:"11px 16px",color:T.text}}>{fmtDate(b.date)}</td>
                <td style={{padding:"11px 16px"}}><Badge status={b.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Login Screen ────────────────────────────────────────────────────────── */
const loginAttempts = { count: 0, lockedUntil: 0 };

function LoginScreen({onLogin}){
  const [user,setUser]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const ADMIN_USER = import.meta.env.VITE_ADMIN_USER ?? "";
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS ?? "";

  const handle=async()=>{
    if(!user||!pass){setErr("Please fill all fields.");return;}
    const now=Date.now();
    if(loginAttempts.lockedUntil>now){
      const secs=Math.ceil((loginAttempts.lockedUntil-now)/1000);
      setErr(`Too many attempts. Try again in ${secs}s.`);return;
    }
    setLoading(true);setErr("");
    await new Promise(r=>setTimeout(r,800));
    if(ADMIN_USER&&user===ADMIN_USER&&ADMIN_PASS&&pass===ADMIN_PASS){
      loginAttempts.count=0;
      onLogin();
    }else{
      loginAttempts.count++;
      if(loginAttempts.count>=5) loginAttempts.lockedUntil=Date.now()+60000;
      setErr(loginAttempts.count>=5?"Locked for 60s after 5 failed attempts.":"Invalid credentials.");
      setLoading(false);
    }
  };

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:16}}>
      <div style={{width:"100%",maxWidth:400,padding:"0 16px",boxSizing:"border-box"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:36,gap:12}}>
          <div style={{width:108,height:108,borderRadius:"50%",background:"#fff",
            padding:4,boxShadow:`0 0 0 3px ${T.orange}, 0 0 32px rgba(255,107,0,0.5)`,flexShrink:0}}>
            <img src="/logo.png" alt="Moldova Moto Tours"
              style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover",display:"block"}}/>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:20,fontWeight:900,color:T.text,letterSpacing:"-0.02em"}}>Moldova Moto Tours</div>
            <div style={{fontSize:11,color:T.muted,marginTop:3,letterSpacing:"0.08em",textTransform:"uppercase"}}>Admin Portal</div>
          </div>
        </div>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"32px 28px"}}>
          <div style={{fontSize:16,fontWeight:800,color:T.text,marginBottom:6}}>Sign in</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:24}}>Access the tour management dashboard.</div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <Inp label="Username" value={user} onChange={setUser} placeholder="admin"/>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              <label style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Password</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e=>e.key==="Enter"&&handle()}
                style={{background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:8,padding:"10px 13px",
                  color:T.text,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"}}
                onFocus={e=>e.target.style.borderColor=T.orange}
                onBlur={e=>e.target.style.borderColor=T.border}/>
            </div>
            {err&&<div style={{fontSize:12,color:T.red,background:T.redDim,borderRadius:8,padding:"8px 12px"}}>{err}</div>}
            <button onClick={handle} disabled={loading}
              style={{width:"100%",background:T.orange,color:"#fff",border:"none",borderRadius:9,padding:"12px",
                fontWeight:800,fontSize:14,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",opacity:loading?0.7:1}}>
              {loading?"Signing in…":"Sign in →"}
            </button>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:T.dim}}>
          Contact your administrator for access.
        </div>
      </div>
    </div>
  );
}

/* ── Gallery / Adventures Tab ─────────────────────────────────────────────── */
const BLANK_MEDIA = {
  title:"", type:"image", src:"", tour:"", date:today(), featured:false, caption:""
};

function GalleryTab({data, routes, onSave, onDelete}) {
  const [modal,setModal]       = useState(null);
  const [form,setForm]         = useState(BLANK_MEDIA);
  const [confirmDel,setConfDel]= useState(null);
  const [preview,setPreview]   = useState(null);
  const setF = k => v => setForm(f=>({...f,[k]:v}));

  const openAdd  = () => { setForm(BLANK_MEDIA); setPreview(null); setModal("add"); };
  const openEdit = item => {
    setForm(item);
    setPreview(item.type==="image" ? item.src : null);
    setModal("edit");
  };
  const close = () => { setModal(null); setForm(BLANK_MEDIA); setPreview(null); };

  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const adminKey = import.meta.env.VITE_API_ADMIN_KEY || "";

  const handleFile = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    setUploadErr("");
    try {
      const result = await uploadMedia(file, adminKey);
      setF("src")(result.url);
      if (file.type.startsWith("image/")) setPreview(result.url);
    } catch (err) {
      setUploadErr(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.title || !form.src) return;
    onSave({...form, id: form.id || "g"+uid()}, modal==="edit");
    close();
  };

  const typeOpts  = [{value:"image",label:"📷 Photo"},{value:"video",label:"🎬 Video"}];
  const tourOpts  = [{value:"",label:"Not linked to a tour"},...routes.map(r=>({value:r.name,label:r.name}))];
  const imgCount  = data.filter(i=>i.type==="image").length;
  const vidCount  = data.filter(i=>i.type==="video").length;

  return (
    <>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:16,flexWrap:"wrap"}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:800,color:T.text,margin:0}}>Adventures Gallery</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:T.muted}}>{data.length} items · {imgCount} photos · {vidCount} videos</p>
        </div>
        <div style={{display:"flex",gap:10}}>
          <RLink to="/adventures" target="_blank"
            style={{display:"flex",alignItems:"center",gap:6,background:"transparent",
              border:`1.5px solid ${T.border}`,borderRadius:9,padding:"8px 14px",
              color:T.muted,fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:"inherit"}}>
            🔗 View Page
          </RLink>
          <Btn onClick={openAdd}>+ Add Media</Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
        <StatCard label="Photos"   value={imgCount}                      icon="📷" accent={T.orange}/>
        <StatCard label="Videos"   value={vidCount}                      icon="🎬" accent={T.blue}/>
        <StatCard label="Featured" value={data.filter(i=>i.featured).length} icon="⭐" accent={T.yellow}/>
      </div>

      {/* Grid */}
      {data.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 0",color:T.dim}}>
          <div style={{fontSize:40,marginBottom:12}}>🖼️</div>
          <div style={{fontSize:14,color:T.muted}}>No media yet. Click "+ Add Media" to get started.</div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
          {data.map(item=>(
            <div key={item.id} style={{background:T.card,border:`1px solid ${T.border}`,
              borderRadius:14,overflow:"hidden",position:"relative"}}>
              {/* Thumbnail */}
              <div style={{height:150,background:T.elevated,position:"relative",overflow:"hidden"}}>
                {item.type==="image" ? (
                  <img src={item.src} alt={item.title}
                    style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                ) : (
                  <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",
                    justifyContent:"center",background:T.bg}}>
                    <span style={{fontSize:36}}>🎬</span>
                  </div>
                )}
                {item.featured && (
                  <div style={{position:"absolute",top:8,right:8,background:T.orange,color:"#fff",
                    fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:5}}>★ FEATURED</div>
                )}
                <div style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,0.65)",
                  color:"#ccc",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,
                  textTransform:"uppercase",letterSpacing:"0.06em"}}>
                  {item.type==="image"?"Photo":"Video"}
                </div>
              </div>
              {/* Info */}
              <div style={{padding:"12px 14px 14px"}}>
                <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:4,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                {item.tour && <div style={{fontSize:11,color:T.orange,marginBottom:4,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.tour}</div>}
                <div style={{fontSize:11,color:T.dim,marginBottom:10}}>{item.date||"—"}</div>
                <div style={{display:"flex",gap:8}}>
                  <Btn size="sm" variant="ghost" onClick={()=>openEdit(item)}>Edit</Btn>
                  <Btn size="sm" variant="danger" onClick={()=>setConfDel(item)}>Delete</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title={modal==="add"?"Add Media":"Edit Media"} onClose={close} width={640}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Title + Type row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:14,alignItems:"end"}}>
              <Inp label="Title" value={form.title} onChange={setF("title")} required placeholder="e.g. Saharna Monastery at Dawn"/>
              <Sel label="Type" value={form.type} onChange={v=>{setF("type")(v);setPreview(null);}} options={typeOpts}/>
            </div>

            {/* Media source */}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <label style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>
                {form.type==="image" ? "Image Source" : "Video URL or File"}
              </label>

              {/* Preview */}
              {preview && (
                <div style={{width:"100%",height:180,borderRadius:10,overflow:"hidden",
                  background:T.elevated,marginBottom:4}}>
                  <img src={preview} alt="preview"
                    style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                </div>
              )}

              {/* URL input */}
              <input type="url" value={form.src||""} onChange={e=>{setF("src")(e.target.value);if(form.type==="image")setPreview(e.target.value);}}
                placeholder={form.type==="image"
                  ? "https://... image URL"
                  : "https://youtube.com/watch?v=... or direct video URL"}
                style={{background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:8,
                  padding:"10px 13px",color:T.text,fontSize:13,fontFamily:"inherit",
                  outline:"none",width:"100%",boxSizing:"border-box"}}
                onFocus={e=>e.target.style.borderColor=T.orange}
                onBlur={e=>e.target.style.borderColor=T.border}/>

              {/* File upload — images and videos */}
              <div>
                <label style={{
                  display:"flex",alignItems:"center",gap:10,cursor:uploading?"not-allowed":"pointer",
                  background:uploading?"rgba(255,107,0,0.08)":T.elevated,
                  border:`1.5px solid ${uploading?T.orange:T.border}`,borderRadius:10,
                  padding:"10px 16px",fontSize:13,color:uploading?T.orange:T.muted,
                  userSelect:"none",transition:"all 0.15s",fontWeight:600}}
                  onMouseEnter={e=>{if(!uploading)e.currentTarget.style.borderColor=T.orange;}}
                  onMouseLeave={e=>{if(!uploading)e.currentTarget.style.borderColor=T.border;}}>
                  {uploading
                    ? <><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span>
                        <span>Uploading...</span></>
                    : <><span>⬆</span><span>Upload file from device</span>
                        <span style={{marginLeft:"auto",fontSize:11,color:T.dim,fontWeight:400}}>
                          JPG PNG WEBP GIF MP4 MOV · max 20MB
                        </span></>
                  }
                  <input type="file" accept="image/*,video/*" style={{display:"none"}}
                    disabled={uploading} onChange={handleFile}/>
                </label>
                {uploadErr && (
                  <div style={{marginTop:6,fontSize:12,color:T.red,padding:"6px 10px",
                    background:T.redDim,borderRadius:6}}>{uploadErr}</div>
                )}
              </div>
              <div style={{textAlign:"center",fontSize:11,color:T.dim,margin:"2px 0"}}>— or paste a URL below —</div>
            </div>

            {/* Tour + Date row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Sel label="Link to Tour" value={form.tour||""} onChange={setF("tour")} options={tourOpts}/>
              <Inp label="From Date" value={form.date||""} onChange={setF("date")} type="date"/>
            {(form.type==="rental"||!form.tour)&&(
              <Inp label="To Date" value={form.dateTo||""} onChange={v=>{setF("dateTo")(v);
                const ms=new Date(v)-new Date(form.date);
                if(ms>0)setF("rentalDays")(Math.round(ms/86400000));
              }} type="date"/>
            )}
            </div>

            {/* Caption */}
            <Txt label="Caption (optional)" value={form.caption||""} onChange={setF("caption")} rows={2}/>

            {/* Featured toggle */}
            <div onClick={()=>setF("featured")(!form.featured)}
              style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",cursor:"pointer",
                background:form.featured?"rgba(255,107,0,0.07)":T.elevated,
                border:`1.5px solid ${form.featured?T.orange:T.border}`,
                borderRadius:10,transition:"all 0.2s",userSelect:"none"}}>
              <div style={{width:20,height:20,borderRadius:5,flexShrink:0,
                background:form.featured?T.orange:"transparent",
                border:`2px solid ${form.featured?T.orange:T.dim}`,
                display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
                {form.featured&&<span style={{fontSize:11,color:"#fff"}}>✓</span>}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>Mark as Featured</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>Featured items are highlighted with a star badge on the gallery page</div>
              </div>
            </div>

            <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:4}}>
              <Btn variant="ghost" onClick={close}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={!form.title||!form.src}>
                {modal==="add"?"Add to Gallery":"Save Changes"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Confirm message={`Delete "${confirmDel.title}"? This cannot be undone.`}
          onConfirm={()=>{onDelete(confirmDel.id,"gallery");setConfDel(null);}}
          onCancel={()=>setConfDel(null)}/>
      )}
    </>
  );
}


/* ── Users Tab ─────────────────────────────────────────────────────────────── */
function UsersTab({ bookings }) {
  const [search, setSearch] = useState("");

  // Derive unique users from booking data
  const usersMap = {};
  (bookings || []).forEach(b => {
    const key = b.email || b.name;
    if (!key) return;
    if (!usersMap[key]) {
      usersMap[key] = {
        name: b.name || "—",
        email: b.email || "—",
        country: b.country || "—",
        phone: b.phone || "—",
        bookings: 0,
        totalSpend: 0,
        lastBooking: b.createdAt || "—",
        status: "active",
      };
    }
    usersMap[key].bookings++;
    usersMap[key].lastBooking = b.createdAt > usersMap[key].lastBooking
      ? b.createdAt : usersMap[key].lastBooking;
  });
  const users = Object.values(usersMap);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.country.toLowerCase().includes(q);
  });

  const countries = [...new Set(users.map(u => u.country).filter(Boolean))].sort();
  const returning  = users.filter(u => u.bookings > 1).length;

  return (
    <>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:16,flexWrap:"wrap"}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:800,color:T.text,margin:0}}>Riders / Customers</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:T.muted}}>
            {users.length} unique riders from booking history
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
        <StatCard label="Total Riders"    value={users.length}        icon="👥" accent={T.orange}/>
        <StatCard label="Countries"      value={countries.length}     icon="🌍" accent={T.blue}/>
        <StatCard label="Returning"      value={returning}            icon="🔄" accent={T.green}/>
      </div>

      {/* Search */}
      <div style={{marginBottom:18}}>
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by name, email or country…"
          style={{width:"100%",background:T.bg,border:`1.5px solid ${T.border}`,
            borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,
            fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
          onFocus={e=>e.target.style.borderColor=T.orange}
          onBlur={e=>e.target.style.borderColor=T.border}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 0",color:T.dim}}>
          <div style={{fontSize:40,marginBottom:12}}>👥</div>
          <div style={{fontSize:14,color:T.muted}}>
            {users.length === 0
              ? "No users yet — they appear automatically as bookings are made."
              : "No users match your search."}
          </div>
        </div>
      ) : (
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
          {/* Table header */}
          <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr",
            padding:"10px 18px",background:T.elevated,borderBottom:`1px solid ${T.border}`,
            fontSize:10,fontWeight:800,color:T.dim,letterSpacing:"0.1em",textTransform:"uppercase"}}>
            <span>Name</span>
            <span>Email</span>
            <span>Country</span>
            <span>Bookings</span>
            <span>Last Seen</span>
          </div>
          {filtered.map((u, i) => (
            <div key={i}
              style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr",
                padding:"13px 18px",borderBottom:i<filtered.length-1?`1px solid ${T.border}`:"none",
                alignItems:"center",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.elevated}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {/* Avatar + Name */}
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,
                  background:`rgba(255,107,0,${0.1+((i*37)%4)*0.06})`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontWeight:800,fontSize:12,color:T.orange}}>
                  {(u.name[0]||"?").toUpperCase()}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:T.text}}>{u.name}</div>
                  {u.phone && u.phone !== "—" && (
                    <div style={{fontSize:11,color:T.dim,marginTop:1}}>{u.phone}</div>
                  )}
                </div>
              </div>
              {/* Email */}
              <div style={{fontSize:12,color:T.muted,overflow:"hidden",textOverflow:"ellipsis",
                whiteSpace:"nowrap",paddingRight:8}}>{u.email}</div>
              {/* Country */}
              <div style={{fontSize:12,color:T.text}}>{u.country}</div>
              {/* Bookings badge */}
              <div>
                <span style={{background:u.bookings>1?"rgba(255,107,0,0.12)":"transparent",
                  color:u.bookings>1?T.orange:T.muted,
                  border:`1px solid ${u.bookings>1?"rgba(255,107,0,0.3)":T.border}`,
                  borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:700}}>
                  {u.bookings} {u.bookings===1?"booking":"bookings"}
                </span>
              </div>
              {/* Last seen */}
              <div style={{fontSize:11,color:T.dim}}>{u.lastBooking}</div>
            </div>
          ))}
        </div>
      )}

      {/* Countries breakdown */}
      {countries.length > 0 && (
        <div style={{marginTop:24,background:T.card,border:`1px solid ${T.border}`,
          borderRadius:14,padding:"16px 18px"}}>
          <div style={{fontSize:11,fontWeight:800,color:T.orange,letterSpacing:"0.1em",
            textTransform:"uppercase",marginBottom:12}}>Riders by Country</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {countries.map(country => {
              const count = users.filter(u => u.country === country).length;
              return (
                <div key={country} style={{background:T.elevated,borderRadius:8,
                  padding:"5px 12px",fontSize:12,color:T.text,
                  border:`1px solid ${T.border}`}}>
                  {country} <span style={{color:T.orange,fontWeight:700,marginLeft:4}}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}


/* ── Sidebar ─────────────────────────────────────────────────────────────── */
const NAV_ITEMS=[
  {id:"dashboard",icon:"⊞",label:"Dashboard"},
  {id:"routes",   icon:"🗺️",label:"Routes"},
  {id:"bookings", icon:"📋",label:"Bookings"},
  {id:"fleet",    icon:"🏍️",label:"Fleet"},
  {id:"gallery",  icon:"🖼️", label:"Adventures"},
  {id:"users",    icon:"👥", label:"Riders"},
];

function Sidebar({active,setActive,onLogout,bookings}){
  const pending=bookings.filter(b=>b.status==="pending").length;
  return(
    <aside style={{width:220,background:T.surface,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0,minHeight:"100vh"}}>
      <div style={{padding:"22px 20px 14px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:"#fff",
            padding:2,boxShadow:`0 0 0 2px ${T.orange}`,flexShrink:0}}>
            <img src="/logo.png" alt="MMT"
              style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover",display:"block"}}/>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:900,color:T.text,lineHeight:1}}>Moldova Moto</div>
            <div style={{fontSize:10,color:T.dim,letterSpacing:"0.08em",textTransform:"uppercase"}}>Admin</div>
          </div>
        </div>
        <Link to="/" style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.dim,textDecoration:"none",transition:"color 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.color=T.muted}
          onMouseLeave={e=>e.currentTarget.style.color=T.dim}>
          ← Back to website
        </Link>
      </div>
      <nav style={{flex:1,padding:"14px 10px"}}>
        {NAV_ITEMS.map(item=>{
          const isActive=active===item.id;
          return(
            <button key={item.id} onClick={()=>setActive(item.id)}
              style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
                gap:10,padding:"9px 12px",borderRadius:9,border:"none",cursor:"pointer",
                background:isActive?T.orangeDim:"transparent",
                color:isActive?T.orange:T.muted,fontFamily:"inherit",fontSize:13,
                fontWeight:isActive?700:500,marginBottom:2,transition:"all 0.15s",textAlign:"left"}}
              onMouseEnter={e=>{if(!isActive){e.currentTarget.style.background=T.elevated;e.currentTarget.style.color=T.text;}}}
              onMouseLeave={e=>{if(!isActive){e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.muted;}}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>{item.icon}</span>{item.label}
              </div>
              {item.id==="bookings"&&pending>0&&(
                <span style={{background:T.yellow,color:"#000",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:800,lineHeight:1.6}}>{pending}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div style={{padding:"14px 10px",borderBottom:`1px solid ${T.border}`}}>
        <button onClick={onLogout}
          style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,
            border:"none",cursor:"pointer",background:"transparent",color:T.dim,fontFamily:"inherit",fontSize:12,fontWeight:600}}
          onMouseEnter={e=>{e.currentTarget.style.background=T.elevated;e.currentTarget.style.color=T.text;}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.dim;}}>
          <span>⎋</span> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ── Root Admin App ──────────────────────────────────────────────────────── */
export default function MoldovaMotoAdmin(){
  const [authed,setAuthed]=useState(false);
  const [tab,setTab]=useState("dashboard");
  const [db,setDb]=useState(null);
  const [toast,setToast]=useState({msg:"",type:"success"});
  const [apiOnline,setApiOnline]=useState(true);

  // Admin API key — stored in env (for Brevo/admin use in dev)
  const adminKey = import.meta.env.VITE_API_ADMIN_KEY || "";

  // Load local data (routes, fleet, gallery) from localStorage
  // Load bookings from API if available, fall back to localStorage
  const loadAll = useCallback(async () => {
    const local = loadDB();

    if (!adminKey) {
      // No API key set — use localStorage bookings (dev fallback)
      setDb(local);
      return;
    }

    try {
      const { bookings } = await fetchBookings({}, adminKey);
      // Merge: use API bookings, local routes/fleet/gallery
      setDb({ ...local, bookings });
      setApiOnline(true);
    } catch (err) {
      console.warn("[Admin] API unavailable, using localStorage bookings:", err.message);
      setApiOnline(false);
      setDb(local);
    }
  }, [adminKey]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Poll for new bookings every 30 seconds when on bookings/dashboard tab
  useEffect(() => {
    if (!authed || !adminKey) return;
    const interval = setInterval(() => {
      if (tab === "bookings" || tab === "dashboard") loadAll();
    }, 30000);
    return () => clearInterval(interval);
  }, [authed, tab, adminKey, loadAll]);

  // Persist routes/fleet/gallery to localStorage; bookings go to API
  const persist = useCallback((nextDb) => {
    setDb(nextDb);
    // Only persist non-booking entities to localStorage
    const { bookings: _b, ...localOnly } = nextDb;
    saveDB({ ...loadDB(), ...localOnly });
  }, []);

  const notify=(msg,type="success")=>{
    setToast({msg,type});
    setTimeout(()=>setToast({msg:"",type:"success"}),3000);
  };

  const handleSave = entity => async (record, isEdit) => {
    if (entity === "bookings" && adminKey) {
      try {
        let saved;
        if (isEdit) {
          saved = await updateBooking(record.id, toServerBooking(record), adminKey);
        } else {
          // Create via public POST (server assigns id + forces status="pending"),
          // then PATCH status if admin set a non-pending status on creation.
          const res  = await createBooking(toServerBooking(record));
          saved = res.booking;
          if (record.status && record.status !== "pending") {
            saved = await updateBooking(saved.id, { status: record.status }, adminKey);
          }
        }
        setDb(prev => ({
          ...prev,
          bookings: isEdit
            ? prev.bookings.map(b => b.id === saved.id ? saved : b)
            : [...prev.bookings, saved],
        }));
        notify(isEdit ? "Updated successfully." : "Created successfully.");
        return;
      } catch (err) {
        notify("API error: " + err.message, "error");
        return;
      }
    }
    // All other entities use localStorage
    const list = db[entity];
    const next = isEdit ? list.map(r=>r.id===record.id?record:r) : [...list, record];
    persist({...db, [entity]: next});
    notify(isEdit ? "Updated successfully." : "Created successfully.");
  };

  const handleDelete = (id, entity) => {
    if (entity === "bookings" && adminKey) {
      deleteBooking(id, adminKey)
        .then(() => {
          setDb(prev => ({ ...prev, bookings: prev.bookings.filter(b => b.id !== id) }));
          notify("Booking deleted.", "warn");
        })
        .catch(err => notify("API error: " + err.message, "error"));
      return;
    }
    persist({...db, [entity]: db[entity].filter(r=>r.id!==id)});
    notify("Record deleted.", "warn");
  };

  const css=`
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:${T.bg};color:${T.text};}
    ::-webkit-scrollbar{width:5px;height:5px;}
    ::-webkit-scrollbar-track{background:${T.surface};}
    ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  `;

  if(!authed)return(<><style>{css}</style><LoginScreen onLogin={()=>{setAuthed(true);setTab("dashboard");}}/></>);
  if(!db)return(<div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",color:T.muted,fontSize:14}}>Loading…</div>);

  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex"}}>
      <style>{css}</style>
      <div className="admin-sidebar"><Sidebar active={tab} setActive={setTab} onLogout={()=>setAuthed(false)} bookings={db.bookings}/></div>
      <main className="admin-main" style={{flex:1,overflowX:"hidden",overflowY:"auto",padding:"32px 36px",minHeight:"100vh",background:T.bg}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:32,paddingBottom:20,borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:12,color:T.muted}}>
            <span style={{color:T.dim}}>MoldovaMoto /</span>
            <span style={{color:T.text,fontWeight:600,marginLeft:6}}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:7,height:7,borderRadius:"50%",
              background:apiOnline?T.green:T.yellow,
              boxShadow:"0 0 0 2px "+(apiOnline?T.greenDim:T.yellowDim)}}/>
            <span style={{fontSize:12,color:T.muted}}>
              {apiOnline?"All systems operational":"Offline mode — localStorage"}
            </span>
            <div style={{width:1,height:16,background:T.border}}/>
            <div style={{width:28,height:28,borderRadius:8,background:T.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800}}>A</div>
            <span style={{fontSize:12,color:T.text,fontWeight:600}}>admin</span>
          </div>
        </div>
        <div style={{animation:"fadeIn 0.25s ease"}} key={tab}>
          {tab==="dashboard"&&<DashboardTab routes={db.routes} bookings={db.bookings} fleet={db.fleet}/>}
          {tab==="routes"   &&<RoutesTab    data={db.routes} bookings={db.bookings} onSave={handleSave("routes")} onDelete={handleDelete}/>}
          {tab==="bookings" &&<BookingsTab  data={db.bookings} routes={db.routes} fleet={db.fleet} onSave={handleSave("bookings")} onDelete={handleDelete}/>}
          {tab==="fleet"    &&<FleetTab     data={db.fleet} onSave={handleSave("fleet")} onDelete={handleDelete}/>}
          {tab==="gallery"  &&<GalleryTab   data={db.gallery||[]} routes={db.routes||[]} onSave={handleSave("gallery")} onDelete={handleDelete}/>}
          {tab==="users"    &&<UsersTab     bookings={db.bookings||[]} />}
        </div>
      </main>
      <Toast msg={toast.msg} type={toast.type}/>
    </div>
  );
}
