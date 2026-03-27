import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { SEED, STORAGE_KEY, loadDB, saveDB, uid, spotsLeft } from "../store.js";
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
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",
      justifyContent:"center",padding:16,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{width:"100%",maxWidth:width,background:T.card,border:`1px solid ${T.border}`,
        borderRadius:16,overflow:"hidden",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"18px 24px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <span style={{fontWeight:800,fontSize:16,color:T.text}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20,padding:"2px 6px"}}>x</button>
        </div>
        <div style={{padding:"24px",overflowY:"auto"}}>{children}</div>
      </div>
    </div>
  );
}

function Confirm({message,onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:10000,display:"flex",alignItems:"center",
      justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)"}}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,
        padding:"28px 32px",width:360,textAlign:"center"}}>
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

function Table({columns,rows,onEdit,onDelete}){
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
                  <button
                    title={row.visible!==false?"Hide from public":"Show to public"}
                    onClick={()=>{const updated={...row,visible:row.visible===false?true:false};onSave(updated,true);}}
                    style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:7,
                      padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                      color:row.visible!==false?T.green:T.red,transition:"all 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=row.visible!==false?T.green:T.red}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                    {row.visible!==false?"👁 Visible":"🚫 Hidden"}
                  </button>
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
        <Table columns={cols} rows={displayed} onEdit={openEdit} onDelete={r=>setConfirmDel(r)}/>
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
                  {/* File upload → base64 */}
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",
                    background:T.elevated,border:`1px solid ${T.border}`,borderRadius:8,
                    padding:"7px 12px",fontSize:12,color:T.muted,userSelect:"none",
                    transition:"border-color 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=T.orange}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                    <span style={{fontSize:14}}>📁</span>
                    <span>Upload from device</span>
                    <input type="file" accept="image/*" style={{display:"none"}}
                      onChange={e=>{
                        const file=e.target.files?.[0];
                        if(!file)return;
                        const reader=new FileReader();
                        reader.onload=ev=>setF("img")(ev.target.result);
                        reader.readAsDataURL(file);
                        e.target.value="";
                      }}/>
                  </label>
                  {form.img&&(
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
  date:today(),experience:"intermediate",status:"pending",bike:"",createdAt:today()};

function BookingsTab({data,routes,fleet,onSave,onDelete}){
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState(BLANK_BOOKING);
  const [confirmDel,setConfirmDel]=useState(null);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");

  const openAdd=()=>{setForm(BLANK_BOOKING);setModal("add");};
  const openEdit=b=>{setForm(b);setModal("edit");};
  const closeModal=()=>{setModal(null);setForm(BLANK_BOOKING);};

  const handleSave=()=>{
    if(!form.name||!form.email)return;
    onSave({...form,id:form.id||"b"+uid2()},modal==="edit");
    closeModal();
  };

  const quickStatus=(id,status)=>{
    const rec=data.find(b=>b.id===id);
    if(!rec)return;
    if(status==="confirmed"&&rec.type!=="rental"){
      const route=(routes||[]).find(r=>r.name===rec.tour);
      if(route&&route.dateType==="scheduled"&&rec.departureId){
        const dep=(route.departures||[]).find(d=>d.id===rec.departureId);
        const left=spotsLeft(dep,data);
        if(left<=0&&!window.confirm(
          "This departure is at capacity (" + (dep?.maxSpots||0) + "/" + (dep?.maxSpots||0) + " spots taken).\nConfirm this booking anyway?"
        ))return;
      }
    }
    onSave({...rec,status},true);
  };

  // Find departure date label for a booking
  const depDate=(b)=>{
    const route=routes.find(r=>r.name===b.tour);
    if(!route||!b.departureId)return b.date||"—";
    const dep=(route.departures||[]).find(d=>d.id===b.departureId);
    return dep?fmtDate(dep.date):(b.date?fmtDate(b.date):"—");
  };

  const displayed=data
    .filter(b=>filter==="all"||b.status===filter)
    .filter(b=>!search||b.name.toLowerCase().includes(search.toLowerCase())||b.tour.toLowerCase().includes(search.toLowerCase()));

  const pending=data.filter(b=>b.status==="pending").length;
  const confirmed=data.filter(b=>b.status==="confirmed").length;
  const revenue=data.filter(b=>b.status==="confirmed"&&b.type!=="rental").reduce((s,b)=>{
    const r=routes.find(r=>r.name===b.tour);return s+(r?.price||0);
  },0);

  const cols=[
    {key:"name",   label:"Rider",  render:v=><span style={{fontWeight:700,color:T.text}}>{v}</span>},
    {key:"type",   label:"Type",   render:(v,row)=>v==="rental"?<Badge status="rental" text="Rental"/>:<span style={{color:T.muted,fontSize:11}}>Guided</span>},
    {key:"tour",   label:"Tour",   render:v=><span style={{color:T.muted,fontSize:12,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",display:"block"}}>{v}</span>},
    {key:"date",   label:"Departure",render:(_,row)=><span style={{fontWeight:600}}>{depDate(row)}</span>},
    {key:"country",label:"From",   render:v=><span style={{color:T.muted}}>{v}</span>},
    {key:"bike",   label:"Bike",   render:v=><span style={{color:T.muted,fontSize:12}}>{v||"—"}</span>},
    {key:"status", label:"Status", render:(v,row)=>(
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <Badge status={v}/>
        {v==="pending"&&(
          <div style={{display:"flex",gap:4}}>
            {(()=>{
              const route=(routes||[]).find(r=>r.name===row.tour);
              const dep=route&&(route.departures||[]).find(d=>d.id===row.departureId);
              const left=dep?spotsLeft(dep,data):99;
              const full=left<=0;
              return(
                <button onClick={e=>{e.stopPropagation();quickStatus(row.id,"confirmed");}}
                  title={full?"At capacity — click to override":"Confirm booking"}
                  style={{background:full?T.yellowDim:T.greenDim,color:full?T.yellow:T.green,
                    border:`1px solid ${full?T.yellow:T.green}`,borderRadius:5,padding:"2px 7px",
                    fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  {full?"!OK":"OK"}
                </button>
              );
            })()}
            <button onClick={e=>{e.stopPropagation();quickStatus(row.id,"cancelled");}}
              style={{background:T.redDim,color:T.red,border:`1px solid ${T.red}`,borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>X</button>
          </div>
        )}
      </div>
    )},
  ];

  const setF=k=>v=>setForm(f=>({...f,[k]:v}));
  const tourOpts=[{value:"",label:"Select tour…"},...routes.map(r=>({value:r.name,label:r.name})),{value:"Motorcycle Rental",label:"Motorcycle Rental (Free Riding)"}];
  const bikeOpts=[{value:"",label:"Select bike…"},...fleet.map(f=>({value:f.name,label:`${f.name} (${f.status})`}))];
  const expOpts=["beginner","intermediate","advanced","expert"].map(v=>({value:v,label:v.charAt(0).toUpperCase()+v.slice(1)}));
  const statOpts=["pending","confirmed","cancelled"].map(v=>({value:v,label:v.charAt(0).toUpperCase()+v.slice(1)}));
  const typeOpts=[{value:"guided",label:"Guided Tour"},{value:"rental",label:"Free Riding Rental"}];

  // Departures for selected tour in form
  const selectedRoute=routes.find(r=>r.name===form.tour);
  const depOpts=selectedRoute&&selectedRoute.dateType==="scheduled"
    ?[{value:"",label:"Select departure…"},...(selectedRoute.departures||[]).map(d=>({value:d.id,label:fmtDate(d.date)+` — ${d.maxSpots} spots`}))]
    :[];

  return(
    <>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:16,flexWrap:"wrap"}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:800,color:T.text,margin:0}}>Bookings</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:T.muted}}>{data.length} total · {pending} pending</p>
        </div>
        <Btn onClick={openAdd}>+ New Booking</Btn>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
        <StatCard label="Pending"   value={pending}       icon="⏳" accent={T.yellow}/>
        <StatCard label="Confirmed" value={confirmed}     icon="✅" accent={T.green}/>
        <StatCard label="Revenue"   value={fmtPrice(revenue)} icon="€" accent={T.orange}/>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:20,alignItems:"center",flexWrap:"wrap"}}>
        {["all","pending","confirmed","cancelled"].map(f=>(
          <Pill key={f} active={filter===f} onClick={()=>setFilter(f)}>
            {f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}
          </Pill>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search rider or tour…"
          style={{marginLeft:"auto",background:T.elevated,border:`1px solid ${T.border}`,borderRadius:8,
            padding:"6px 12px",color:T.text,fontSize:12,fontFamily:"inherit",outline:"none",width:200}}
          onFocus={e=>e.target.style.borderColor=T.orange}
          onBlur={e=>e.target.style.borderColor=T.border}/>
      </div>

      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
        <Table columns={cols} rows={displayed} onEdit={openEdit} onDelete={r=>setConfirmDel(r)}/>
      </div>

      {modal&&(
        <Modal title={modal==="add"?"New Booking":"Edit Booking"} onClose={closeModal}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Sel label="Type"   value={form.type||"guided"} onChange={setF("type")} options={typeOpts}/>
              <Sel label="Status" value={form.status}         onChange={setF("status")} options={statOpts}/>
            </div>
            <Sel label="Tour" value={form.tour} onChange={v=>{setF("tour")(v);setF("departureId")("");}} options={tourOpts} required/>
            {depOpts.length>0&&(
              <Sel label="Departure Date" value={form.departureId||""} onChange={setF("departureId")} options={depOpts}/>
            )}
            {(!selectedRoute||selectedRoute.dateType==="open")&&(
              <Inp label="Date" value={form.date} onChange={setF("date")} type="date"/>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Inp label="Rider Name" value={form.name}    onChange={setF("name")}    required placeholder="Full name"/>
              <Inp label="Country"    value={form.country} onChange={setF("country")} placeholder="Germany"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Inp label="Email" value={form.email} onChange={setF("email")} type="email" required placeholder="rider@mail.com"/>
              <Inp label="Phone" value={form.phone} onChange={setF("phone")} placeholder="+49 ..."/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
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
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,fontWeight:700,color:T.text}}>Upcoming Departures</span>
          <span style={{fontSize:11,color:T.muted}}>Spots decrease automatically when bookings are confirmed</span>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${T.border}`}}>
              {["Tour","Date","Booked","Cap.","Spots Left","Status"].map(h=>(
                <th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(()=>{
              const todayS=new Date().toISOString().slice(0,10);
              const rows=[];
              (routes||[]).forEach(route=>{
                if(route.dateType!=="scheduled")return;
                (route.departures||[]).filter(d=>d.date>=todayS).sort((a,b)=>a.date.localeCompare(b.date)).forEach(dep=>{
                  const booked=(bookings||[]).filter(b=>b.departureId===dep.id&&b.status==="confirmed").length;
                  const left=Math.max(0,(dep.maxSpots||0)-booked);
                  rows.push({rName:route.name,dep,booked,left});
                });
              });
              if(rows.length===0)return(
                <tr><td colSpan={6} style={{padding:"24px 16px",textAlign:"center",color:T.dim}}>
                  No upcoming scheduled departures. Add departure dates to a route first.
                </td></tr>
              );
              return rows.slice(0,10).map(({rName,dep,booked,left})=>(
                <tr key={dep.id} style={{borderBottom:`1px solid ${T.border}`}}>
                  <td style={{padding:"10px 14px",color:T.text,fontWeight:600,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{rName}</td>
                  <td style={{padding:"10px 14px",color:T.text,whiteSpace:"nowrap"}}>{fmtDate(dep.date)}</td>
                  <td style={{padding:"10px 14px",color:T.orange,fontWeight:700}}>{booked}</td>
                  <td style={{padding:"10px 14px",color:T.muted}}>{dep.maxSpots}</td>
                  <td style={{padding:"10px 14px",fontWeight:700,color:left===0?T.red:left<=2?T.yellow:T.green}}>{left}</td>
                  <td style={{padding:"10px 14px"}}>
                    <Badge status={left===0?"full":left<=2?"filling":"available"}
                      text={left===0?"FULL":left<=2?"Filling":"Open"}/>
                  </td>
                </tr>
              ));
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
      <div style={{width:"100%",maxWidth:400}}>
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

  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setF("src")(ev.target.result); setPreview(ev.target.result); };
    reader.readAsDataURL(file);
    e.target.value = "";
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

              {/* File upload (images only) */}
              {form.type==="image" && (
                <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",
                  background:T.elevated,border:`1px solid ${T.border}`,borderRadius:8,
                  padding:"8px 14px",fontSize:12,color:T.muted,userSelect:"none"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=T.orange}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                  <span>📁</span><span>Upload from device</span>
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
                </label>
              )}
            </div>

            {/* Tour + Date row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Sel label="Link to Tour" value={form.tour||""} onChange={setF("tour")} options={tourOpts}/>
              <Inp label="Date" value={form.date||""} onChange={setF("date")} type="date"/>
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


/* ── Sidebar ─────────────────────────────────────────────────────────────── */
const NAV_ITEMS=[
  {id:"dashboard",icon:"⊞",label:"Dashboard"},
  {id:"routes",   icon:"🗺️",label:"Routes"},
  {id:"bookings", icon:"📋",label:"Bookings"},
  {id:"fleet",    icon:"🏍️",label:"Fleet"},
  {id:"gallery",  icon:"🖼️", label:"Adventures"},
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

  useEffect(()=>{ setDb(loadDB()); },[]);

  const persist=useCallback((nextDb)=>{ setDb(nextDb); saveDB(nextDb); },[]);

  const notify=(msg,type="success")=>{
    setToast({msg,type});
    setTimeout(()=>setToast({msg:"",type:"success"}),3000);
  };

  const handleSave=entity=>(record,isEdit)=>{
    const list=db[entity];
    const next=isEdit?list.map(r=>r.id===record.id?record:r):[...list,record];
    persist({...db,[entity]:next});
    notify(isEdit?"Updated successfully.":"Created successfully.");
  };

  const handleDelete=(id,entity)=>{
    persist({...db,[entity]:db[entity].filter(r=>r.id!==id)});
    notify("Record deleted.","warn");
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
      <Sidebar active={tab} setActive={setTab} onLogout={()=>setAuthed(false)} bookings={db.bookings}/>
      <main style={{flex:1,overflowX:"hidden",overflowY:"auto",padding:"32px 36px",minHeight:"100vh",background:T.bg}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:32,paddingBottom:20,borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:12,color:T.muted}}>
            <span style={{color:T.dim}}>MoldovaMoto /</span>
            <span style={{color:T.text,fontWeight:600,marginLeft:6}}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:T.green,boxShadow:`0 0 0 2px ${T.greenDim}`}}/>
            <span style={{fontSize:12,color:T.muted}}>All systems operational</span>
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
        </div>
      </main>
      <Toast msg={toast.msg} type={toast.type}/>
    </div>
  );
}
