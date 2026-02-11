(function(){
function runWhenReady(fn){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn);else fn();}
runWhenReady(function(){
var steps=document.querySelectorAll(".saiba-step");
var dots=document.querySelectorAll(".progress-dots .dot");
var fill=document.getElementById("progress-fill");
var btn=document.getElementById("btn-avancar");
var counter=document.getElementById("step-counter");
var total=steps.length;
var current=1;
function goTo(n){
current=n;
steps.forEach(function(s){s.classList.remove("active");if(parseInt(s.getAttribute("data-step"),10)===n)s.classList.add("active");});
dots.forEach(function(d){d.classList.remove("active","current");if(parseInt(d.getAttribute("data-step"),10)===n){d.classList.add("active","current");}});
if(fill)fill.style.width=(n/total*100)+"%";
if(counter)counter.textContent="Passo "+n+" de "+total;
if(btn){var span=btn.querySelector(".btn-text");if(span)span.textContent=n===total?"Concluir":"Avançar";}
}
if(btn)btn.addEventListener("click",function(){
if(current<total)goTo(current+1);
else window.location.href="../clone5/index.html"+(window.location.search||"");
});
dots.forEach(function(d,i){d.addEventListener("click",function(){goTo(i+1);});});
goTo(1);
});
})();
