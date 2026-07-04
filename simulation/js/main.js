let last=null;
function g(id){return +document.getElementById(id).value;}
const chart=()=>document.getElementById('chart');
function prod(N,r,K,th){return r*N*(1-Math.pow(Math.max(N,0)/K,th));}
function msyOf(r,K,th){return r*K*(th/(th+1))*Math.pow(1/(th+1),1/th);}
function trajectories(){
  const r=g('r'),K=g('K'),th=g('th'),H=g('H'),n=Math.round(g('steps')),h=g('stepSize');
  const starts=[0.15,0.3,0.45,0.6,0.75,0.9,1.0].map(f=>+(f*K).toFixed(0));
  const colors=['#b50246','#0e7c86','#e0662c','#7d0130','#1f9d55','#3b6fb5','#8a3ffc'];
  const series=starts.map((N0,idx)=>{let N=N0;const data=[[0,N]];
    for(let i=0;i<n;i++){const f=x=>prod(x,r,K,th)-H;const k1=f(N),k2=f(N+.5*h*k1),k3=f(N+.5*h*k2),k4=f(N+h*k3);N=Math.max(0,N+h/6*(k1+2*k2+2*k3+k4));data.push([+((i+1)*h).toFixed(2),N]);}
    return {color:colors[idx%colors.length],name:'N₀ = '+N0,data:data,points:false};});
  return {series,r,K,th,H};
}
function production(){
  const r=g('r'),K=g('K'),th=g('th'),H=g('H');const curve=[],line=[];
  for(let N=0;N<=K;N+=K/120){curve.push([+N.toFixed(1),prod(N,r,K,th)]);line.push([+N.toFixed(1),H]);}
  return {curve,line,r,K,th,H};
}
function run(){
  const m=document.getElementById('plotMode').value,t=document.getElementById('plotTitle');
  if(m==='prod'){const p=production();last={mode:'prod',p};
    Chart.draw(chart(),[{color:'#0e7c86',data:p.curve,points:false},{color:'#d64545',data:p.line,points:false,dash:true}],{xlabel:'Population N',ylabel:'Rate (per year)',ratio:0.52});
    setLegend([{color:'#0e7c86',name:'Production r·N·(1−(N/K)^θ)'},{color:'#d64545',name:'Harvest H'}]);
    t.textContent='Production curve & harvest line';
    document.getElementById('counts').innerHTML=`MSY ≈ <b>${msyOf(p.r,p.K,p.th).toFixed(1)}</b> /yr · Harvest H = <b>${p.H}</b>. If H exceeds MSY the population is driven extinct; the left crossing is an unstable threshold, the right one the stable yield equilibrium.`;
  }else{const r=trajectories();last={mode:'traj',r};
    Chart.draw(chart(),r.series,{xlabel:'Years',ylabel:'Population N',ratio:0.52});setLegend(r.series);
    t.textContent='Population trajectories vs time';
    document.getElementById('counts').innerHTML=`MSY ≈ <b>${msyOf(r.r,r.K,r.th).toFixed(1)}</b> /yr · Harvest H = <b>${r.H}</b>. Trajectories starting below the unstable threshold collapse; those above settle at the stable equilibrium.`;
  }
}
function sync(){document.querySelectorAll('#simbox .val').forEach(function(v){var el=document.getElementById(v.id.slice(2));if(el)v.textContent=el.value;});}
const D={r:1.2,K:1000,th:1,H:295,steps:60,stepSize:1};
function resetSim(){for(const k in D)document.getElementById(k).value=D[k];document.getElementById('plotMode').value='traj';sync();run();toast('Reset');}
function downloadCSV(){if(!last){toast('Run first');return;}let csv;if(last.mode==='prod'){csv='N,production,harvest\n';for(let i=0;i<last.p.curve.length;i++)csv+=last.p.curve[i][0]+','+last.p.curve[i][1]+','+last.p.line[i][1]+'\n';}else{csv='year,'+last.r.series.map(s=>s.name.replace(/[, ]/g,'')).join(',')+'\n';const L=last.r.series[0].data.length;for(let i=0;i<L;i++){csv+=last.r.series[0].data[i][0];last.r.series.forEach(s=>csv+=','+s.data[i][1]);csv+='\n';}}dl(csv,'harvesting.csv','text/csv');toast('CSV downloaded');}
let _rt;sync();window.addEventListener('resize',function(){clearTimeout(_rt);_rt=setTimeout(function(){if(last)run();},120);});
