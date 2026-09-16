(function(){
  const form=document.querySelector('form[action="dashboard.html"]');if(!form)return;
  const message=document.createElement("div");message.style.cssText="display:none;margin-bottom:12px;padding:10px;border:1px solid #c39a4566;border-radius:6px;background:#c39a4512;color:#654c18;font-size:12px";form.prepend(message);
  form.addEventListener("submit",async event=>{
    event.preventDefault();message.style.display="none";
    const email=form.email.value.trim(),loginCode=form.login_code.value.trim();if(!email)return;
    const button=form.querySelector('[type="submit"]');button.disabled=true;button.textContent="Sending verification code…";
    try{
      const response=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({email,loginCode})}),data=await response.json();
      if(!response.ok)throw new Error(data.error||"Sign in failed.");
      const requested=new URLSearchParams(location.search).get("next");
      sessionStorage.setItem("vanguardprimeVerification",JSON.stringify({email:data.email,purpose:data.purpose||"login",maskedEmail:data.maskedEmail,next:requested||""}));
      location.replace(data.purpose==="registration"?"register-confirm.html":"login-confirm.html");
    }catch(error){message.textContent=error.message||"Cannot reach the application server. Start it and try again.";message.style.display="block";button.disabled=false;button.textContent="Continue to Dashboard"}
  });
})();
