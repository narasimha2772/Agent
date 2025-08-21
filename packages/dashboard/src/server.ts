import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
const master = process.env.MASTER_API_BASE || "http://localhost:3000";

app.get("/", async (_req, res) => {
  res.send(`<html><body>
  <h2>Approvals</h2>
  <div id="events"></div>
  <form id="approve">
    <input name="itemId" placeholder="itemId"/>
    <select name="decision"><option>approved</option><option>rejected</option></select>
    <input name="reason" placeholder="reason"/>
    <button type="submit">Send</button>
  </form>
  <script>
    const ws = new WebSocket((location.protocol==='https:'?'wss':'ws')+'://'+location.host.replace(':4000',':3000')+'/ws/events');
    ws.onmessage = (e)=>{ const d = JSON.parse(e.data); const div=document.getElementById('events'); div.innerHTML = '<pre>'+e.data+'</pre>' + div.innerHTML };
    document.getElementById('approve').onsubmit = async (ev)=>{ ev.preventDefault(); const fd=new FormData(ev.target); await fetch('${master}/acp/approve',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ itemId: fd.get('itemId'), decision: fd.get('decision'), reason: fd.get('reason') })}); };
  </script>
  </body></html>`);
});

app.listen(4000, () => console.log("Dashboard on :4000"));

