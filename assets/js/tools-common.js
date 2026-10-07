/* 房產工具箱共用函式 */
(function(){
  var T = {
    $: function(id){ return document.getElementById(id); },
    num: function(id){ var el=document.getElementById(id); if(!el) return 0; var v=parseFloat(String(el.value).replace(/,/g,'')); return isFinite(v)?v:0; },
    val: function(id){ var el=document.getElementById(id); return el?el.value:''; },
    radio: function(name){ var el=document.querySelector('input[name="'+name+'"]:checked'); return el?el.value:''; },
    nt: function(n){ n=Math.round(n); return (n<0?'-':'')+'NT$ '+Math.abs(n).toLocaleString('en-US'); },
    wan: function(yuan, d){ if(d===undefined) d=1; return (yuan/10000).toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:0})+' 萬'; },
    pct: function(n, d){ if(d===undefined) d=2; return n.toFixed(d).replace(/\.?0+$/,'')+'%'; },
    html: function(id, s){ var el=document.getElementById(id); if(el) el.innerHTML=s; },
    /* 本息平均攤還每期付款：P 本金、r 期利率（小數）、n 期數 */
    pmt: function(P, r, n){ if(n<=0) return 0; if(r===0) return P/n; var k=Math.pow(1+r,n); return P*r*k/(k-1); },
    /* 房貸逐月模擬。rateAt(月序號 t) 回傳年利率(%)；graceM 寬限月數；method: equal|principal */
    schedule: function(P, n, graceM, rateAt, method){
      var bal=P, rows=[], total=0, interestTotal=0, curPay=0, curRate=null, first=null, firstAfter=null, lastPay=0;
      var yr={};
      for(var t=1;t<=n;t++){
        var ar=rateAt(t), r=ar/1200, interest=bal*r, princ, pay;
        if(t<=graceM){ princ=0; pay=interest; }
        else if(method==='principal'){ princ=P/(n-graceM); pay=princ+interest; }
        else{
          if(curRate!==ar || (t-1)%12===0 || t===graceM+1){ curPay=T.pmt(bal,r,n-t+1); curRate=ar; }
          princ=curPay-interest; pay=curPay;
        }
        bal-=princ; if(bal<0.5) bal=0;
        total+=pay; interestTotal+=interest; lastPay=pay;
        if(first===null) first=pay;
        if(t===graceM+1) firstAfter=pay;
        var y=Math.ceil(t/12);
        if(!yr[y]) yr[y]={y:y,pay:0,princ:0,interest:0,months:0,rate:ar,firstPay:pay,endBal:0};
        yr[y].pay+=pay; yr[y].princ+=princ; yr[y].interest+=interest; yr[y].months++; yr[y].endBal=bal;
      }
      var list=[]; for(var k in yr) list.push(yr[k]);
      return {years:list, total:total, interest:interestTotal, first:first, firstAfter:(firstAfter===null?first:firstAfter), last:lastPay};
    },
    /* 分頁 */
    tabs: function(root){
      var btns=root.querySelectorAll('.tt-tab'), panes=root.querySelectorAll('.tt-pane');
      function show(i){
        btns.forEach(function(b,j){ b.setAttribute('aria-selected', j===i?'true':'false'); });
        panes.forEach(function(p,j){ p.hidden = (j!==i); });
      }
      btns.forEach(function(b,i){ b.addEventListener('click', function(){ show(i); }); });
      show(0);
    },
    /* 輸入變動即時重算 */
    bind: function(scope, fn){
      var els=scope.querySelectorAll('input,select');
      els.forEach(function(e){ e.addEventListener('input', fn); e.addEventListener('change', fn); });
      fn();
    },
    /* 日期加 N 年（含閏年處理） */
    addYears: function(d, n){ var x=new Date(d.getTime()); x.setFullYear(x.getFullYear()+n); return x; },
    /* 持有期間分級：回傳 0:≤2年 1:2-5年 2:5-10年 3:>10年；超過才進下一級 */
    holdTier: function(acq, sold){
      if(sold>T.addYears(acq,10)) return 3;
      if(sold>T.addYears(acq,5)) return 2;
      if(sold>T.addYears(acq,2)) return 1;
      return 0;
    },
    years: function(acq, sold){ return (sold-acq)/(365.25*86400000); }
  };
  window.T = T;
})();
