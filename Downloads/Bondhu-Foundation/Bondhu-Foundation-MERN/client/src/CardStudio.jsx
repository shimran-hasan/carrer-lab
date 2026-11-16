import React from "react";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, LogOut, Save, ShoppingBag, UserRound } from "lucide-react";
import api from "./api";

const blank = { institutionType:"School", institutionName:"", studentName:"", studentId:"", classOrDepartment:"", session:"", phone:"", photoUrl:"", logoUrl:"", primaryColor:"#14532d", accentColor:"#dc2626", title:"STUDENT ID CARD" };
const tokenKey = "bondhu_customer_token";

export default function CardStudio() {
  const [customer,setCustomer] = useState(null);
  const [mode,setMode] = useState("login");
  const [auth,setAuth] = useState({name:"",email:"",password:""});
  const [design,setDesign] = useState(blank);
  const [orders,setOrders] = useState([]);
  const [delivery,setDelivery] = useState({quantity:1,deliveryName:"",phone:"",address:"",notes:""});
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);
  const [side,setSide] = useState("front");

  const customerApi = (method,url,data) => api({method,url,data,headers:{Authorization:`Bearer ${localStorage.getItem(tokenKey)}`}});
  async function load() {
    const [d,o] = await Promise.all([customerApi("get","/customers/design"),customerApi("get","/customers/orders")]);
    if (d.data.design) setDesign({...blank,...d.data.design});
    setOrders(o.data.orders || []);
  }
  useEffect(()=>{ const token=localStorage.getItem(tokenKey); if(token) customerApi("get","/customers/me").then(r=>{setCustomer(r.data.customer);return load();}).catch(()=>localStorage.removeItem(tokenKey)); },[]);
  function update(key,value){setDesign(current=>({...current,[key]:value}));}
  async function authenticate(e) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const endpoint=mode==="register"?"/customers/register":"/customers/login";
      const {data}=await api.post(endpoint,auth);
      localStorage.setItem(tokenKey,data.token); setCustomer(data.customer); await load();
    } catch(error) { setMessage(error.response?.data?.message || "Could not connect to API."); }
    finally { setBusy(false); }
  }
  async function saveDesign(){
    setBusy(true); setMessage("");
    try { const {data}=await customerApi("put","/customers/design",design); setDesign({...blank,...data.design}); setMessage("Design saved successfully."); }
    catch(error){setMessage(error.response?.data?.message||"Could not save design.");}
    finally{setBusy(false);}
  }
  async function placeOrder(e){
    e.preventDefault(); setBusy(true); setMessage("");
    try { await saveDesign(); const {data}=await customerApi("post","/customers/orders",delivery); setMessage(`Print order ${data.order._id} submitted successfully.`); await load(); }
    catch(error){setMessage(error.response?.data?.message||"Could not submit order.");}
    finally{setBusy(false);}
  }
  function logout(){localStorage.removeItem(tokenKey);setCustomer(null);setOrders([]);setDesign(blank);}
  if(!customer) return <div className="login-page"><form className="login-card" onSubmit={authenticate}><div className="logo">✦</div><p className="kicker">BONDHU CARD STUDIO</p><h1>{mode==="login"?"Customer sign in":"Create customer account"}</h1><p className="muted">Design your school, college or university ID card and order printed copies.</p>{mode==="register"&&<label>Full name<input value={auth.name} onChange={e=>setAuth({...auth,name:e.target.value})} required/></label>}<label>Email address<input type="email" value={auth.email} onChange={e=>setAuth({...auth,email:e.target.value})} required/></label><label>Password<input type="password" minLength="8" value={auth.password} onChange={e=>setAuth({...auth,password:e.target.value})} required/></label>{message&&<div className="error">{message}</div>}<button className="btn primary full" disabled={busy}>{busy?"Please wait…":mode==="login"?"Sign in":"Create account"}</button><button type="button" className="text-button" onClick={()=>{setMode(mode==="login"?"register":"login");setMessage("");}}>{mode==="login"?"New customer? Create an account":"Already registered? Sign in"}</button><a className="text-button" href="/">← Back to admin portal</a></form></div>;
  return <div className="studio-shell"><header className="studio-header"><div><div className="kicker">BONDHU FOUNDATION</div><h1>Student ID Card Studio</h1><p className="muted">Welcome, {customer.name}. Design, preview and order printed cards.</p></div><button className="btn soft" onClick={logout}><LogOut size={16}/> Sign out</button></header>
    {message&&<div className="notice">{message}<button onClick={()=>setMessage("")}>×</button></div>}
    <div className="studio-grid"><section className="panel"><h2>Card Settings</h2><p className="muted">Enter student details and customize your card.</p><div className="fields">
      <label>Institution type<select value={design.institutionType} onChange={e=>update("institutionType",e.target.value)}>{["School","College","University"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Card heading<input value={design.title} onChange={e=>update("title",e.target.value)}/></label>
      <label className="wide">Institution name<input value={design.institutionName} onChange={e=>update("institutionName",e.target.value)} placeholder="Institution name"/></label>
      <label>Student name<input value={design.studentName} onChange={e=>update("studentName",e.target.value)}/></label>
      <label>Student ID<input value={design.studentId} onChange={e=>update("studentId",e.target.value)}/></label>
      <label>Class / Department<input value={design.classOrDepartment} onChange={e=>update("classOrDepartment",e.target.value)}/></label>
      <label>Session<input value={design.session} onChange={e=>update("session",e.target.value)}/></label>
      <label>Phone<input value={design.phone} onChange={e=>update("phone",e.target.value)}/></label>
      <label className="wide">Student photo URL<input value={design.photoUrl} onChange={e=>update("photoUrl",e.target.value)} placeholder="https://..."/></label>
      <label className="wide">Institution logo URL<input value={design.logoUrl} onChange={e=>update("logoUrl",e.target.value)} placeholder="https://..."/></label>
      <label>Primary color<input type="color" value={design.primaryColor} onChange={e=>update("primaryColor",e.target.value)}/></label>
      <label>Accent color<input type="color" value={design.accentColor} onChange={e=>update("accentColor",e.target.value)}/></label>
    </div><button className="btn primary" onClick={saveDesign} disabled={busy}><Save size={16}/> Save design</button></section>
    <section className="panel preview-panel"><h2>Live card preview</h2><div className="tabs"><button className={side==="front"?"chosen":""} onClick={()=>setSide("front")}>Front</button><button className={side==="back"?"chosen":""} onClick={()=>setSide("back")}>Back</button></div>
      <div className="student-card" style={{"--card-primary":design.primaryColor,"--card-accent":design.accentColor}}>{side==="front"?<><div className="student-card-top">{design.logoUrl?<img src={design.logoUrl} alt="Institution logo"/>:<span>✦</span>}<div><b>{design.institutionName||"Institution Name"}</b><small>{design.institutionType}</small></div></div><div className="student-card-title">{design.title}</div><div className="student-card-body"><div className="student-photo">{design.photoUrl?<img src={design.photoUrl} alt="Student"/>:<UserRound size={48}/>}</div><div><h3>{design.studentName||"Student Name"}</h3><p>ID: {design.studentId||"000000"}</p><p>{design.classOrDepartment||"Class / Department"}</p><p>{design.session||"Session"}</p></div></div><div className="student-card-foot">{design.phone||"Institution contact"}</div></>:<div className="student-card-back"><h3>{design.institutionName||"Institution Name"}</h3><QRCodeSVG value={JSON.stringify({institution:design.institutionName,studentId:design.studentId,name:design.studentName})} size={112}/><p>Student ID: {design.studentId||"000000"}</p><p>Please return this card to the issuing institution.</p></div>}</div>
      <form className="order-form" onSubmit={placeOrder}><h2>Order printed cards</h2><p className="muted">Submit your design and delivery details. Our team will contact you to confirm pricing and delivery.</p><div className="fields"><label>Quantity<input type="number" min="1" max="5000" value={delivery.quantity} onChange={e=>setDelivery({...delivery,quantity:e.target.value})} required/></label><label>Receiver name<input value={delivery.deliveryName} onChange={e=>setDelivery({...delivery,deliveryName:e.target.value})} required/></label><label>Phone<input value={delivery.phone} onChange={e=>setDelivery({...delivery,phone:e.target.value})} required/></label><label className="wide">Delivery address<input value={delivery.address} onChange={e=>setDelivery({...delivery,address:e.target.value})} required/></label><label className="wide">Additional notes<input value={delivery.notes} onChange={e=>setDelivery({...delivery,notes:e.target.value})}/></label></div><button className="btn primary full" disabled={busy}><ShoppingBag size={16}/> Submit print order</button></form>
    </section></div>
    <section className="panel"><h2>My print orders</h2>{orders.length?<div className="table-wrap"><table><thead><tr><th>ORDER</th><th>QUANTITY</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>{orders.map(o=><tr key={o._id}><td>{o._id.slice(-8).toUpperCase()}</td><td>{o.quantity}</td><td>{new Date(o.createdAt).toLocaleDateString()}</td><td><span className="status on">{o.status}</span></td></tr>)}</tbody></table></div>:<p className="muted">You have not placed any print orders yet.</p>}</section>
  </div>;
}
