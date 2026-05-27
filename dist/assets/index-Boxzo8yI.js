(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),((e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports))((()=>{var e={food:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C5642" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,culture:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C5642" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 7v10"/><path d="M21 7v10"/><path d="M7 7v10"/><path d="M11 7v10"/><path d="M15 7v10"/><path d="M19 7v10"/><polygon points="12 2 22 7 2 7 12 2"/></svg>`,star:`<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,costGold:`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4A45A" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`,costStamina:`<svg width="12" height="12" viewBox="0 0 24 24" fill="#3B82F6" stroke="#3B82F6" stroke-width="1"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`};function t(t){return e.star.repeat(t)}function n(n){return`
    <div class="travel-card ${n.rarityClass}">
      <div class="travel-card__header">
        <div class="travel-card__tags">
          <div class="tag-icon">${e.food}</div>
          <div class="tag-icon">${e.culture}</div>
          <div class="rarity-badge">${t(n.starCount)}</div>
        </div>
        <div class="vp-badge">
          ${e.star}<span>${n.vp} VP</span>
        </div>
      </div>

      <div class="travel-card__title-bar">
        <h3>${n.title}</h3>
      </div>
      
      <div class="travel-card__image-section" style="background-image: url('${n.imageUrl}');">
        <div class="city-tag">${n.location}</div>
      </div>

      <div class="travel-card__description">
        <p>${n.description}</p>
      </div>

      <div class="travel-card__footer">
        <div class="footer-costs">
          <div class="cost-item">
            ${e.costGold} <span class="label">Cost:</span> <span class="value">${n.goldCost}</span>
          </div>
          <div class="cost-item">
            ${e.costStamina} <span class="label">Cost:</span> <span class="value">${n.staminaCost}</span>
          </div>
        </div>
        <div class="footer-bonus">
          <div class="bonus-title">COMBO BONUS</div>
          <div class="bonus-condition">${n.bonusCondition}</div>
          <div class="bonus-reward">${n.bonusReward}</div>
        </div>
      </div>
    </div>`}window.addEventListener(`DOMContentLoaded`,()=>{let e=document.getElementById(`card-container`);e&&(e.innerHTML=[{rarityClass:`travel-card--uncommon`,starCount:2,vp:12,title:`Cà Phê Trứng`,location:`HÀ NỘI`,description:`A creamy egg coffee that's both rich and delicate. Sip slowly while watching the Old Quarter bustle below.`,goldCost:30,staminaCost:5,bonusCondition:`If 2 Food tags:`,bonusReward:`+5 VP`,imageUrl:`https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400`},{rarityClass:`travel-card--legendary`,starCount:5,vp:85,title:`Ha Long Bay Cruise`,location:`QUẢNG NINH`,description:`Sail through emerald waters and towering limestone karsts. An overnight journey into legend.`,goldCost:400,staminaCost:60,bonusCondition:`If 4+ cards:`,bonusReward:`+30 VP`,imageUrl:`https://images.unsplash.com/photo-1528127269322-539801943592?w=400`}].map(e=>n(e)).join(``))})}))();