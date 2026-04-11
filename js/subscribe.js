// Shared email signup handler — safe DOM, no innerHTML
(function(){
  document.querySelectorAll("form[data-listmonk]").forEach(function(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var email = form.querySelector("input[type=email]").value.trim();
      var btn = form.querySelector("button");
      btn.disabled = true;
      fetch("https://listmonk.aimastertools.com/api/public/subscription", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: email, name: "", list_uuids: ["2a453160-af75-4758-a2d8-d834dd409986"]})
      }).then(function(r){
        if(r.ok){
          var p = document.createElement("p");
          p.style.cssText = "color:#3b82f6;font-weight:600;";
          p.textContent = "Subscribed! Check your inbox.";
          form.parentNode.replaceChild(p, form);
        } else {
          btn.disabled = false;
        }
      }).catch(function(){ btn.disabled = false; });
    });
  });
})();
