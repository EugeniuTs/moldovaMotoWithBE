import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { SEED, STORAGE_KEY, loadDB, saveDB, uid } from "../store.js";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  bg:       "#0a0a0b",
  surface:  "#111113",
  card:     "#16161a",
  elevated: "#1c1c21",
  border:   "#26262d",
  borderHi: "#35353e",
  orange:   "#ff6b00",
  orangeDim:"rgba(255,107,0,0.12)",
  orangeMid:"rgba(255,107,0,0.25)",
  text:     "#f0f0f4",
  muted:    "#72727a",
  dim:      "#44444c",
  green:    "#22c55e",
  greenDim: "rgba(34,197,94,0.12)",
  red:      "#ef4444",
  redDim:   "rgba(239,68,68,0.12)",
  yellow:   "#eab308",
  yellowDim:"rgba(234,179,8,0.12)",
  blue:     "#3b82f6",
  blueDim:  "rgba(59,130,246,0.12)",
};


/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtPrice = p => `€${Number(p).toLocaleString()}`;

const STATUS_COLORS = {
  active:      { bg: T.greenDim,  text: T.green,  dot: T.green },
  draft:       { bg: T.yellowDim, text: T.yellow, dot: T.yellow },
  confirmed:   { bg: T.greenDim,  text: T.green,  dot: T.green },
  pending:     { bg: T.yellowDim, text: T.yellow, dot: T.yellow },
  cancelled:   { bg: T.redDim,    text: T.red,    dot: T.red },
  available:   { bg: T.greenDim,  text: T.green,  dot: T.green },
  "in-use":    { bg: T.blueDim,   text: T.blue,   dot: T.blue },
  maintenance: { bg: T.yellowDim, text: T.yellow, dot: T.yellow },
};

function Badge({ status, text }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg,
      color:s.text, borderRadius:6, padding:"3px 9px", fontSize:11, fontWeight:700,
      letterSpacing:"0.04em", textTransform:"uppercase" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, flexShrink:0 }}/>
      {text || status}
    </span>
  );
}

function Pill({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: active ? T.orange : T.elevated,
      color: active ? "#fff" : T.muted, border: `1px solid ${active ? T.orange : T.border}`,
      borderRadius:8, padding:"5px 14px", fontSize:12, fontWeight:700, cursor:"pointer",
      fontFamily:"inherit", transition:"all 0.15s", letterSpacing:"0.04em" }}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type="text", placeholder, small, required }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && <label style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>{label}{required && <span style={{color:T.orange}}> *</span>}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        style={{ background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:8,
          padding: small ? "7px 11px" : "10px 13px", color:T.text, fontSize:13,
          fontFamily:"inherit", outline:"none", transition:"border-color 0.15s",
          width:"100%", boxSizing:"border-box" }}
        onFocus={e=>e.target.style.borderColor=T.orange}
        onBlur={e=>e.target.style.borderColor=T.border}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && <label style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>{label}{required && <span style={{color:T.orange}}> *</span>}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{ background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:8,
          padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit",
          outline:"none", cursor:"pointer", appearance:"none", width:"100%",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%23ff6b00' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center" }}
        onFocus={e=>e.target.style.borderColor=T.orange}
        onBlur={e=>e.target.style.borderColor=T.border}>
        {options.map(o => <option key={o.value} value={o.value} style={{background:T.card}}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, rows=3 }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {label && <label style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>{label}</label>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows}
        style={{ background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:8,
          padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit",
          outline:"none", resize:"vertical", width:"100%", boxSizing:"border-box",
          lineHeight:1.55 }}
        onFocus={e=>e.target.style.borderColor=T.orange}
        onBlur={e=>e.target.style.borderColor=T.border}
      />
    </div>
  );
}

function Btn({ children, onClick, variant="primary", size="md", disabled, type="button" }) {
  const v = { primary:{bg:T.orange,color:"#fff",border:T.orange},
               ghost:  {bg:"transparent",color:T.muted,border:T.border},
               danger: {bg:T.redDim,color:T.red,border:T.red} }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ background:v.bg, color:v.color, border:`1.5px solid ${v.border}`,
        borderRadius:8, padding: size==="sm"?"6px 12px":"9px 18px",
        fontSize: size==="sm"?11:13, fontWeight:700, cursor:disabled?"not-allowed":"pointer",
        fontFamily:"inherit", letterSpacing:"0.04em", opacity:disabled?0.5:1,
        transition:"opacity 0.15s" }}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   MODAL WRAPPER
───────────────────────────────────────────── */
function Modal({ title, onClose, children, width=560 }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center",
      justifyContent:"center", padding:16, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%", maxWidth:width, background:T.card, border:`1px solid ${T.border}`,
        borderRadius:16, overflow:"hidden", maxHeight:"90vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"18px 24px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
          <span style={{ fontWeight:800, fontSize:16, color:T.text }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted,
            cursor:"pointer", fontSize:20, lineHeight:1, padding:"2px 6px" }}>×</button>
        </div>
        <div style={{ padding:"24px", overflowY:"auto" }}>{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONFIRM DIALOG
───────────────────────────────────────────── */
function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:10000, display:"flex", alignItems:"center",
      justifyContent:"center", background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)" }}>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14,
        padding:"28px 32px", width:360, textAlign:"center" }}>
        <div style={{ fontSize:28, marginBottom:12 }}>🗑️</div>
        <div style={{ fontWeight:700, fontSize:15, color:T.text, marginBottom:8 }}>Are you sure?</div>
        <div style={{ fontSize:13, color:T.muted, marginBottom:24 }}>{message}</div>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="danger" onClick={onConfirm}>Delete</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function Toast({ msg, type }) {
  if (!msg) return null;
  const bg = type==="error" ? T.redDim : type==="warn" ? T.yellowDim : T.greenDim;
  const col = type==="error" ? T.red : type==="warn" ? T.yellow : T.green;
  return (
    <div style={{ position:"fixed", bottom:28, right:28, zIndex:99999,
      background:T.elevated, border:`1.5px solid ${col}`, borderRadius:10,
      padding:"12px 18px", display:"flex", alignItems:"center", gap:10,
      boxShadow:"0 8px 32px rgba(0,0,0,0.5)", animation:"fadeUp 0.3s ease" }}>
      <span style={{ color:col, fontSize:16 }}>{type==="error"?"✕":type==="warn"?"⚠":"✓"}</span>
      <span style={{ fontSize:13, color:T.text, fontWeight:600 }}>{msg}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TABLE
───────────────────────────────────────────── */
function Table({ columns, rows, onEdit, onDelete }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ borderBottom:`1px solid ${T.border}` }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding:"10px 14px", textAlign:"left",
                fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.08em",
                textTransform:"uppercase", whiteSpace:"nowrap" }}>{c.label}</th>
            ))}
            <th style={{ padding:"10px 14px", textAlign:"right", fontSize:11, color:T.muted,
              fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length+1} style={{ padding:"40px 14px", textAlign:"center",
              color:T.dim, fontSize:13 }}>No records yet.</td></tr>
          )}
          {rows.map((row, ri) => (
            <tr key={row.id} style={{ borderBottom:`1px solid ${T.border}`,
              background: ri%2===0 ? "transparent" : "rgba(255,255,255,0.01)",
              transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,107,0,0.04)"}
              onMouseLeave={e=>e.currentTarget.style.background=ri%2===0?"transparent":"rgba(255,255,255,0.01)"}>
              {columns.map(c => (
                <td key={c.key} style={{ padding:"12px 14px", color:T.text, whiteSpace:"nowrap" }}>
                  {c.render ? c.render(row[c.key], row) : <span style={{color: c.dim ? T.muted : T.text}}>{row[c.key] ?? "—"}</span>}
                </td>
              ))}
              <td style={{ padding:"12px 14px", textAlign:"right" }}>
                <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
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

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14,
      padding:"20px 22px", display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div style={{ fontSize:12, color:T.muted, fontWeight:700, letterSpacing:"0.08em",
          textTransform:"uppercase" }}>{label}</div>
        <div style={{ fontSize:20 }}>{icon}</div>
      </div>
      <div style={{ fontSize:34, fontWeight:900, color: accent || T.text, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:T.muted }}>{sub}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
function SectionHeader({ title, sub, onAdd, addLabel }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
      marginBottom:24, gap:16, flexWrap:"wrap" }}>
      <div>
        <h2 style={{ fontSize:20, fontWeight:800, color:T.text, margin:0 }}>{title}</h2>
        {sub && <p style={{ margin:"4px 0 0", fontSize:13, color:T.muted }}>{sub}</p>}
      </div>
      {onAdd && <Btn onClick={onAdd}>+ {addLabel}</Btn>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROUTES CRUD
───────────────────────────────────────────── */
const BLANK_ROUTE = { name:"", price:"", days:1, difficulty:"Medium", status:"active", stops:"", desc:"" };

function RoutesTab({ data, onSave, onDelete }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(BLANK_ROUTE);
  const [confirmDel, setConfirmDel] = useState(null);
  const [filter, setFilter] = useState("all");

  const openAdd = () => { setForm(BLANK_ROUTE); setModal("add"); };
  const openEdit = r => { setForm({ ...r, stops: (r.stops||[]).join(", ") }); setModal("edit"); };
  const closeModal = () => { setModal(null); setForm(BLANK_ROUTE); };

  const handleSave = () => {
    if (!form.name || !form.price) return;
    const rec = { ...form, id: form.id||"r"+uid(), price: Number(form.price),
      stops: form.stops.split(",").map(s=>s.trim()).filter(Boolean) };
    onSave(rec, modal==="edit");
    closeModal();
  };

  const displayed = filter==="all" ? data : data.filter(r=>r.status===filter);

  const cols = [
    { key:"name",       label:"Tour Name", render: (v) => <span style={{fontWeight:700,color:T.text}}>{v}</span> },
    { key:"price",      label:"Price",     render: v => <span style={{color:T.orange,fontWeight:700}}>{fmtPrice(v)}</span> },
    { key:"days",       label:"Days",      render: v => `${v} day${v>1?"s":""}` },
    { key:"difficulty", label:"Level",     render: v => {
      const c = {Easy:T.green,Medium:T.yellow,Hard:T.red}[v]||T.muted;
      return <span style={{color:c,fontWeight:700}}>{v}</span>;
    }},
    { key:"stops",      label:"Stops",     render: v => <span style={{color:T.muted}}>{(v||[]).length} stops</span> },
    { key:"status",     label:"Status",    render: v => <Badge status={v}/> },
  ];

  const setF = k => v => setForm(f=>({...f,[k]:v}));

  return (
    <>
      <SectionHeader title="Routes" sub={`${data.length} total tours`} onAdd={openAdd} addLabel="New Route"/>
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {["all","active","draft"].map(f => <Pill key={f} active={filter===f} onClick={()=>setFilter(f)}>{f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}</Pill>)}
      </div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
        <Table columns={cols} rows={displayed} onEdit={openEdit} onDelete={r=>setConfirmDel(r)}/>
      </div>

      {modal && (
        <Modal title={modal==="add"?"New Route":"Edit Route"} onClose={closeModal}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Input  label="Tour Name"   value={form.name}       onChange={setF("name")}   required placeholder="e.g. 3-Day Moldova Adventure"/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Input  label="Price (€)" value={form.price}      onChange={setF("price")}  type="number" required placeholder="650"/>
              <Input  label="Duration (days)" value={form.days} onChange={setF("days")}   type="number" placeholder="3"/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Select label="Difficulty" value={form.difficulty} onChange={setF("difficulty")}
                options={["Easy","Medium","Hard"].map(v=>({value:v,label:v}))}/>
              <Select label="Status" value={form.status} onChange={setF("status")}
                options={["active","draft"].map(v=>({value:v,label:v.charAt(0).toUpperCase()+v.slice(1)}))}/>
            </div>
            <Input  label="Stops (comma-separated)" value={form.stops} onChange={setF("stops")}
              placeholder="Chișinău, Orheiul Vechi, Saharna"/>
            <Textarea label="Description" value={form.desc} onChange={setF("desc")} rows={3}/>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:4 }}>
              <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={!form.name||!form.price}>
                {modal==="add"?"Create Route":"Save Changes"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Confirm message={`Delete "${confirmDel.name}"? This cannot be undone.`}
          onConfirm={()=>{ onDelete(confirmDel.id,"routes"); setConfirmDel(null); }}
          onCancel={()=>setConfirmDel(null)}/>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   BOOKINGS CRUD
───────────────────────────────────────────── */
const BLANK_BOOKING = {
  tour:"", name:"", email:"", phone:"", country:"", date:today(),
  experience:"intermediate", status:"pending", bike:"", createdAt:today()
};

function BookingsTab({ data, routes, fleet, onSave, onDelete }) {
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(BLANK_BOOKING);
  const [confirmDel, setConfirmDel] = useState(null);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");

  const openAdd  = () => { setForm(BLANK_BOOKING); setModal("add"); };
  const openEdit = b => { setForm(b); setModal("edit"); };
  const closeModal = () => { setModal(null); setForm(BLANK_BOOKING); };

  const handleSave = () => {
    if (!form.name || !form.email || !form.tour) return;
    onSave({ ...form, id: form.id||"b"+uid() }, modal==="edit");
    closeModal();
  };

  const statusUpdate = (id, status) => {
    const rec = data.find(b=>b.id===id);
    if (rec) onSave({ ...rec, status }, true);
  };

  const displayed = data
    .filter(b => filter==="all" || b.status===filter)
    .filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.tour.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key:"name",    label:"Rider", render: v => <span style={{fontWeight:700,color:T.text}}>{v}</span> },
    { key:"tour",    label:"Tour",  render: v => <span style={{color:T.muted,fontSize:12}}>{v}</span> },
    { key:"country", label:"From",  render: v => <span style={{color:T.muted}}>{v}</span> },
    { key:"date",    label:"Date",  render: v => <span style={{fontWeight:600}}>{fmtDate(v)}</span> },
    { key:"bike",    label:"Bike",  render: v => <span style={{color:T.muted,fontSize:12}}>{v}</span> },
    { key:"status",  label:"Status",render: (v,row) => (
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <Badge status={v}/>
        {v==="pending" && (
          <div style={{ display:"flex", gap:4 }}>
            <button onClick={e=>{e.stopPropagation();statusUpdate(row.id,"confirmed");}}
              style={{ background:T.greenDim, color:T.green, border:`1px solid ${T.green}`,
                borderRadius:5, padding:"2px 7px", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✓</button>
            <button onClick={e=>{e.stopPropagation();statusUpdate(row.id,"cancelled");}}
              style={{ background:T.redDim, color:T.red, border:`1px solid ${T.red}`,
                borderRadius:5, padding:"2px 7px", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✕</button>
          </div>
        )}
      </div>
    )},
  ];

  const setF = k => v => setForm(f=>({...f,[k]:v}));
  const tourOptions  = [{ value:"", label:"Select tour…" }, ...routes.map(r=>({value:r.name,label:r.name}))];
  const bikeOptions  = [{ value:"", label:"Select bike…" }, ...fleet.map(f=>({value:f.name,label:`${f.name} (${f.status})`}))];
  const expOptions   = ["beginner","intermediate","advanced","expert"].map(v=>({value:v,label:v.charAt(0).toUpperCase()+v.slice(1)}));
  const statOptions  = ["pending","confirmed","cancelled"].map(v=>({value:v,label:v.charAt(0).toUpperCase()+v.slice(1)}));

  const pending   = data.filter(b=>b.status==="pending").length;
  const confirmed = data.filter(b=>b.status==="confirmed").length;
  const revenue   = data.filter(b=>b.status==="confirmed").reduce((s,b)=>{
    const r = routes.find(r=>r.name===b.tour); return s + (r?.price||0);
  }, 0);

  return (
    <>
      <SectionHeader title="Bookings" sub={`${data.length} total · ${pending} pending`} onAdd={openAdd} addLabel="New Booking"/>

      {/* Mini stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        <StatCard label="Pending"   value={pending}         icon="⏳" accent={T.yellow}/>
        <StatCard label="Confirmed" value={confirmed}       icon="✅" accent={T.green}/>
        <StatCard label="Revenue"   value={fmtPrice(revenue)} icon="💶" accent={T.orange}/>
      </div>

      {/* Filters + search */}
      <div style={{ display:"flex", gap:10, marginBottom:20, alignItems:"center", flexWrap:"wrap" }}>
        {["all","pending","confirmed","cancelled"].map(f=>(
          <Pill key={f} active={filter===f} onClick={()=>setFilter(f)}>
            {f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}
          </Pill>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search rider or tour…"
          style={{ marginLeft:"auto", background:T.elevated, border:`1px solid ${T.border}`,
            borderRadius:8, padding:"6px 12px", color:T.text, fontSize:12, fontFamily:"inherit",
            outline:"none", width:200 }}
          onFocus={e=>e.target.style.borderColor=T.orange}
          onBlur={e=>e.target.style.borderColor=T.border}
        />
      </div>

      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
        <Table columns={cols} rows={displayed} onEdit={openEdit} onDelete={r=>setConfirmDel(r)}/>
      </div>

      {modal && (
        <Modal title={modal==="add"?"New Booking":"Edit Booking"} onClose={closeModal}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Select label="Tour" value={form.tour} onChange={setF("tour")} options={tourOptions} required/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Input label="Rider Name" value={form.name} onChange={setF("name")} required placeholder="Full name"/>
              <Input label="Country" value={form.country} onChange={setF("country")} placeholder="Germany"/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Input label="Email" value={form.email} onChange={setF("email")} type="email" required placeholder="rider@mail.com"/>
              <Input label="Phone" value={form.phone} onChange={setF("phone")} placeholder="+49 ..."/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
              <Input label="Departure Date" value={form.date} onChange={setF("date")} type="date"/>
              <Select label="Experience" value={form.experience} onChange={setF("experience")} options={expOptions}/>
              <Select label="Status" value={form.status} onChange={setF("status")} options={statOptions}/>
            </div>
            <Select label="Assign Bike" value={form.bike} onChange={setF("bike")} options={bikeOptions}/>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:4 }}>
              <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={!form.name||!form.email||!form.tour}>
                {modal==="add"?"Create Booking":"Save Changes"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Confirm message={`Delete booking for "${confirmDel.name}"? This cannot be undone.`}
          onConfirm={()=>{ onDelete(confirmDel.id,"bookings"); setConfirmDel(null); }}
          onCancel={()=>setConfirmDel(null)}/>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   FLEET CRUD
───────────────────────────────────────────── */
const BLANK_BIKE = { name:"", model:"CFMOTO 800MT Adventure", year:2024, status:"available", odometer:"", lastService:today(), color:"Storm Black", features:"ABS, Traction Control, Heated Grips, Cruise Control" };

function FleetTab({ data, onSave, onDelete }) {
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(BLANK_BIKE);
  const [confirmDel, setConfirmDel] = useState(null);

  const openAdd  = () => { setForm(BLANK_BIKE); setModal("add"); };
  const openEdit = b => { setForm({ ...b, features:(b.features||[]).join(", ") }); setModal("edit"); };
  const closeModal = () => { setModal(null); setForm(BLANK_BIKE); };

  const handleSave = () => {
    if (!form.name) return;
    onSave({ ...form, id:form.id||"f"+uid(), odometer:Number(form.odometer)||0,
      features: form.features.split(",").map(s=>s.trim()).filter(Boolean) }, modal==="edit");
    closeModal();
  };

  const cols = [
    { key:"name",        label:"Name",    render: v => <span style={{fontWeight:700,color:T.text}}>{v}</span> },
    { key:"model",       label:"Model",   render: v => <span style={{color:T.muted,fontSize:12}}>{v}</span> },
    { key:"year",        label:"Year" },
    { key:"color",       label:"Color",   render: v => <span style={{color:T.muted}}>{v}</span> },
    { key:"odometer",    label:"Odometer",render: v => <span style={{fontWeight:600}}>{Number(v||0).toLocaleString()} km</span> },
    { key:"lastService", label:"Last Svc",render: v => <span style={{color:T.muted}}>{fmtDate(v)}</span> },
    { key:"status",      label:"Status",  render: v => <Badge status={v}/> },
  ];

  const setF = k => v => setForm(f=>({...f,[k]:v}));
  const statusOpts = ["available","in-use","maintenance"].map(v=>({value:v,label:v.replace("-"," ").replace(/\b\w/g,c=>c.toUpperCase())}));

  const available   = data.filter(b=>b.status==="available").length;
  const inUse       = data.filter(b=>b.status==="in-use").length;
  const maintenance = data.filter(b=>b.status==="maintenance").length;

  return (
    <>
      <SectionHeader title="Fleet" sub={`${data.length} motorcycles`} onAdd={openAdd} addLabel="Add Bike"/>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        <StatCard label="Available"   value={available}   icon="🏍️" accent={T.green}/>
        <StatCard label="In Use"      value={inUse}       icon="🛣️" accent={T.blue}/>
        <StatCard label="Maintenance" value={maintenance} icon="🔧" accent={T.yellow}/>
      </div>

      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
        <Table columns={cols} rows={data} onEdit={openEdit} onDelete={r=>setConfirmDel(r)}/>
      </div>

      {/* Card view */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16, marginTop:20 }}>
        {data.map(bike=>(
          <div key={bike.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"18px 20px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:14, color:T.text }}>{bike.name}</div>
                <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{bike.color} · {bike.year}</div>
              </div>
              <Badge status={bike.status}/>
            </div>
            <div style={{ fontSize:12, color:T.muted, marginBottom:10 }}>
              {Number(bike.odometer||0).toLocaleString()} km · Svc: {fmtDate(bike.lastService)}
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {(bike.features||[]).slice(0,3).map(f=>(
                <span key={f} style={{ background:T.elevated, border:`1px solid ${T.border}`,
                  borderRadius:5, padding:"2px 7px", fontSize:10, color:T.muted }}>{f}</span>
              ))}
              {(bike.features||[]).length>3 && (
                <span style={{ background:T.elevated, border:`1px solid ${T.border}`,
                  borderRadius:5, padding:"2px 7px", fontSize:10, color:T.dim }}>+{bike.features.length-3}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal==="add"?"Add Motorcycle":"Edit Motorcycle"} onClose={closeModal}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Input label="Display Name" value={form.name} onChange={setF("name")} required placeholder="CFMOTO 800MT #5"/>
              <Input label="Model"        value={form.model} onChange={setF("model")} placeholder="CFMOTO 800MT Adventure"/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
              <Input  label="Year"        value={form.year}      onChange={setF("year")}       type="number" placeholder="2024"/>
              <Input  label="Color"       value={form.color}     onChange={setF("color")}       placeholder="Storm Black"/>
              <Select label="Status"      value={form.status}    onChange={setF("status")}      options={statusOpts}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Input label="Odometer (km)" value={form.odometer}    onChange={setF("odometer")} type="number" placeholder="0"/>
              <Input label="Last Service"  value={form.lastService} onChange={setF("lastService")} type="date"/>
            </div>
            <Input label="Features (comma-separated)" value={form.features} onChange={setF("features")}
              placeholder="ABS, Traction Control, Heated Grips, Cruise Control"/>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:4 }}>
              <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={!form.name}>
                {modal==="add"?"Add to Fleet":"Save Changes"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Confirm message={`Remove "${confirmDel.name}" from the fleet? This cannot be undone.`}
          onConfirm={()=>{ onDelete(confirmDel.id,"fleet"); setConfirmDel(null); }}
          onCancel={()=>setConfirmDel(null)}/>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD TAB
───────────────────────────────────────────── */
function DashboardTab({ routes, bookings, fleet }) {
  const pending    = bookings.filter(b=>b.status==="pending").length;
  const confirmed  = bookings.filter(b=>b.status==="confirmed").length;
  const revenue    = bookings.filter(b=>b.status==="confirmed").reduce((s,b)=>{
    const r = routes.find(r=>r.name===b.tour); return s+(r?.price||0);
  }, 0);
  const available  = fleet.filter(f=>f.status==="available").length;

  // Recent bookings
  const recent = [...bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);

  // Revenue by tour
  const byTour = routes.map(r=>{
    const count = bookings.filter(b=>b.status==="confirmed"&&b.tour===r.name).length;
    return { name:r.name, count, rev: count*r.price };
  }).sort((a,b)=>b.rev-a.rev);

  const maxRev = Math.max(...byTour.map(t=>t.rev), 1);

  return (
    <>
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:T.text, margin:"0 0 4px" }}>Dashboard</h2>
        <p style={{ fontSize:13, color:T.muted, margin:0 }}>Overview of MoldovaMoto operations.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
        <StatCard label="Active Routes"   value={routes.filter(r=>r.status==="active").length} icon="🗺️" accent={T.orange}/>
        <StatCard label="Pending Bookings" value={pending}       icon="⏳" accent={T.yellow} sub="Awaiting confirmation"/>
        <StatCard label="Revenue (confirmed)" value={fmtPrice(revenue)} icon="💶" accent={T.green} sub={`${confirmed} confirmed`}/>
        <StatCard label="Bikes Available" value={`${available}/${fleet.length}`} icon="🏍️" accent={T.blue}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {/* Revenue by tour */}
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"20px 22px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:18 }}>Revenue by Tour</div>
          {byTour.map(t=>(
            <div key={t.name} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, color:T.muted, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</span>
                <span style={{ fontSize:12, fontWeight:700, color:T.orange }}>{fmtPrice(t.rev)}</span>
              </div>
              <div style={{ background:T.elevated, borderRadius:4, height:6, overflow:"hidden" }}>
                <div style={{ width:`${(t.rev/maxRev)*100}%`, height:"100%", background:T.orange, borderRadius:4, transition:"width 0.5s ease" }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Fleet status */}
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"20px 22px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:18 }}>Fleet Status</div>
          {fleet.map(b=>(
            <div key={b.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"9px 0", borderBottom:`1px solid ${T.border}` }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{b.name}</div>
                <div style={{ fontSize:11, color:T.dim }}>{Number(b.odometer||0).toLocaleString()} km</div>
              </div>
              <Badge status={b.status}/>
            </div>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}` }}>
          <span style={{ fontSize:13, fontWeight:700, color:T.text }}>Recent Bookings</span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${T.border}` }}>
              {["Rider","Tour","Date","Country","Status"].map(h=>(
                <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:11,
                  color:T.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map(b=>(
              <tr key={b.id} style={{ borderBottom:`1px solid ${T.border}` }}>
                <td style={{ padding:"11px 16px", fontWeight:700, color:T.text }}>{b.name}</td>
                <td style={{ padding:"11px 16px", color:T.muted, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.tour}</td>
                <td style={{ padding:"11px 16px", color:T.text }}>{fmtDate(b.date)}</td>
                <td style={{ padding:"11px 16px", color:T.muted }}>{b.country}</td>
                <td style={{ padding:"11px 16px" }}><Badge status={b.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   LOGIN SCREEN
───────────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [user, setUser]   = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!user || !pass) { setErr("Please fill all fields."); return; }
    setLoading(true); setErr("");
    await new Promise(r=>setTimeout(r,700));
    if (user==="admin" && pass==="moldova2024") {
      onLogin();
    } else {
      setErr("Invalid credentials. Hint: admin / moldova2024");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:"system-ui,sans-serif", padding:16 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        {/* Logo */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:36, gap:12 }}>
          <div style={{ width:52, height:52, background:T.orange, borderRadius:14,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>🏍️</div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:900, color:T.text, letterSpacing:"-0.02em" }}>
              Moldova<span style={{color:T.orange}}>Moto</span>
            </div>
            <div style={{ fontSize:12, color:T.muted, marginTop:2, letterSpacing:"0.06em", textTransform:"uppercase" }}>
              Admin Portal
            </div>
          </div>
        </div>

        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"32px 28px" }}>
          <div style={{ fontSize:16, fontWeight:800, color:T.text, marginBottom:6 }}>Sign in</div>
          <div style={{ fontSize:12, color:T.muted, marginBottom:24 }}>Access the tour management dashboard.</div>

          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Input label="Username" value={user} onChange={setUser} placeholder="admin"/>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Password</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
                placeholder="••••••••••"
                onKeyDown={e=>e.key==="Enter"&&handle()}
                style={{ background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:8,
                  padding:"10px 13px", color:T.text, fontSize:13, fontFamily:"inherit",
                  outline:"none", width:"100%", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor=T.orange}
                onBlur={e=>e.target.style.borderColor=T.border}
              />
            </div>
            {err && <div style={{ fontSize:12, color:T.red, background:T.redDim, borderRadius:8, padding:"8px 12px" }}>{err}</div>}
            <button onClick={handle} disabled={loading}
              style={{ width:"100%", background:T.orange, color:"#fff", border:"none",
                borderRadius:9, padding:"12px", fontWeight:800, fontSize:14, cursor:loading?"not-allowed":"pointer",
                fontFamily:"inherit", opacity:loading?0.7:1, transition:"opacity 0.2s" }}>
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:16, fontSize:11, color:T.dim }}>
          Demo credentials: <span style={{color:T.muted}}>admin / moldova2024</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SIDEBAR NAV
───────────────────────────────────────────── */
const NAV_ITEMS = [
  { id:"dashboard", icon:"⊞",  label:"Dashboard" },
  { id:"routes",    icon:"🗺️", label:"Routes" },
  { id:"bookings",  icon:"📋", label:"Bookings" },
  { id:"fleet",     icon:"🏍️", label:"Fleet" },
];

function Sidebar({ active, setActive, onLogout, bookings }) {
  const pending = bookings.filter(b=>b.status==="pending").length;
  return (
    <aside style={{ width:220, background:T.surface, borderRight:`1px solid ${T.border}`,
      display:"flex", flexDirection:"column", flexShrink:0, minHeight:"100vh" }}>
      {/* Logo */}
      <div style={{ padding:"22px 20px 18px", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, background:T.orange, borderRadius:8,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🏍️</div>
          <div>
            <div style={{ fontSize:14, fontWeight:900, color:T.text, lineHeight:1 }}>
              Moldova<span style={{color:T.orange}}>Moto</span>
            </div>
            <div style={{ fontSize:10, color:T.dim, letterSpacing:"0.08em", textTransform:"uppercase" }}>Admin</div>
          </div>
        </div>
        <Link to="/" style={{ display:"flex", alignItems:"center", gap:5, marginTop:12, fontSize:11,
          color:T.dim, textDecoration:"none", letterSpacing:"0.04em", transition:"color 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.color=T.muted}
          onMouseLeave={e=>e.currentTarget.style.color=T.dim}>
          ← Back to website
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"14px 10px" }}>
        {NAV_ITEMS.map(item=>{
          const isActive = active===item.id;
          return (
            <button key={item.id} onClick={()=>setActive(item.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                gap:10, padding:"9px 12px", borderRadius:9, border:"none", cursor:"pointer",
                background: isActive ? T.orangeDim : "transparent",
                color: isActive ? T.orange : T.muted,
                fontFamily:"inherit", fontSize:13, fontWeight: isActive ? 700 : 500,
                marginBottom:2, transition:"all 0.15s",
                textAlign:"left" }}
              onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background=T.elevated; e.currentTarget.style.color=T.text; }}
              onMouseLeave={e=>{ if(!isActive){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=T.muted; }}}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:16 }}>{item.icon}</span>
                {item.label}
              </div>
              {item.id==="bookings" && pending>0 && (
                <span style={{ background:T.yellow, color:"#000", borderRadius:10, padding:"1px 7px",
                  fontSize:10, fontWeight:800, lineHeight:1.6 }}>{pending}</span>
              )}
              {isActive && <span style={{ fontSize:16, opacity:0.6 }}>›</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding:"14px 10px", borderTop:`1px solid ${T.border}` }}>
        <button onClick={onLogout}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
            padding:"9px 12px", borderRadius:9, border:"none", cursor:"pointer",
            background:"transparent", color:T.dim, fontFamily:"inherit", fontSize:12, fontWeight:600,
            transition:"all 0.15s" }}
          onMouseEnter={e=>{ e.currentTarget.style.background=T.elevated; e.currentTarget.style.color=T.text; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=T.dim; }}>
          <span>⎋</span> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────
   ROOT ADMIN APP
───────────────────────────────────────────── */
// STORAGE_KEY, SEED, loadDB, saveDB and uid are imported from ../../store.js

export default function MoldovaMotoAdmin() {
  const [authed, setAuthed]   = useState(false);
  const [tab, setTab]         = useState("dashboard");
  const [db, setDb]           = useState(null);       // null = loading
  const [toast, setToast]     = useState({ msg:"", type:"success" });

  /* ── Load from shared store on mount ── */
  useEffect(() => {
    setDb(loadDB());
  }, []);

  /* ── Write to shared store ── */
  const persist = useCallback((nextDb) => {
    setDb(nextDb);
    saveDB(nextDb);
  }, []);

  /* ── Toast helper ── */
  const notify = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"success" }), 3000);
  };

  /* ── Generic CRUD handlers ── */
  const handleSave = (entity) => (record, isEdit) => {
    const list  = db[entity];
    const next  = isEdit ? list.map(r=>r.id===record.id ? record : r) : [...list, record];
    persist({ ...db, [entity]: next });
    notify(isEdit ? `Updated successfully.` : `Created successfully.`);
  };

  const handleDelete = (id, entity) => {
    persist({ ...db, [entity]: db[entity].filter(r=>r.id!==id) });
    notify("Record deleted.", "warn");
  };

  /* ── CSS ── */
  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: ${T.bg}; color: ${T.text}; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: ${T.surface}; }
    ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  `;

  if (!authed) return (
    <>
      <style>{css}</style>
      <LoginScreen onLogin={() => setAuthed(true)} />
    </>
  );

  if (!db) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center",
      justifyContent:"center", color:T.muted, fontSize:14 }}>Loading…</div>
  );

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex" }}>
      <style>{css}</style>

      <Sidebar active={tab} setActive={setTab} onLogout={()=>setAuthed(false)} bookings={db.bookings}/>

      <main style={{ flex:1, overflowX:"hidden", overflowY:"auto", padding:"32px 36px",
        minHeight:"100vh", background:T.bg }}>
        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom:32, paddingBottom:20, borderBottom:`1px solid ${T.border}` }}>
          <div style={{ fontSize:12, color:T.muted }}>
            <span style={{ color:T.dim }}>MoldovaMoto /</span>
            <span style={{ color:T.text, fontWeight:600, marginLeft:6 }}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:T.green,
              boxShadow:`0 0 0 2px ${T.greenDim}` }}/>
            <span style={{ fontSize:12, color:T.muted }}>All systems operational</span>
            <div style={{ width:1, height:16, background:T.border }}/>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:T.orange,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800 }}>A</div>
              <span style={{ fontSize:12, color:T.text, fontWeight:600 }}>admin</span>
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div style={{ animation:"fadeIn 0.25s ease" }} key={tab}>
          {tab==="dashboard" && <DashboardTab routes={db.routes} bookings={db.bookings} fleet={db.fleet}/>}
          {tab==="routes"    && <RoutesTab   data={db.routes}   onSave={handleSave("routes")}   onDelete={handleDelete}/>}
          {tab==="bookings"  && <BookingsTab data={db.bookings} routes={db.routes} fleet={db.fleet} onSave={handleSave("bookings")} onDelete={handleDelete}/>}
          {tab==="fleet"     && <FleetTab    data={db.fleet}    onSave={handleSave("fleet")}    onDelete={handleDelete}/>}
        </div>
      </main>

      <Toast msg={toast.msg} type={toast.type}/>
    </div>
  );
}
