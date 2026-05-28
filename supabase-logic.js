const SUPABASE_URL = "https://gkqlmpkmzfvurkzgrjlm.supabase.co";
const SUPABASE_KEY = "sb_publishable_TpKfbr8y19-DzT9dQvlr5Q_2MR-ciXr";

function connexion() {
    const phone = document.getElementById("loginPhone").value.trim();
    if(phone.length < 8) { alert("Numéro invalide"); return; }
    localStorage.setItem("phone", phone);
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("welcomeBox").style.display = "block";
}

function ouvrirCatalogue() {
    document.getElementById("welcomeBox").style.display = "none";
    document.getElementById("catalogBox").style.display = "block";
    genererCatalogueEspaces();
}

async function genererCatalogueEspaces() {
    const container = document.getElementById("spacesContainer");
    container.innerHTML = "Chargement...";
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?status=eq.confirmé&select=*`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        container.innerHTML = "";
        data.forEach(item => {
            const row = document.createElement("div");
            row.className = "espace-ligne";
            row.innerHTML = `<div>${item.name_file || 'Espace'}</div>
                             <button onclick="selectionnerAchat('${item.name_file}', ${item.amount}, ${item.espace_num})">Accéder</button>`;
            container.appendChild(row);
        });
    } catch(e) { container.innerHTML = "Erreur chargement."; }
}

function selectionnerAchat(nom, montant, espaceNum) {
    window.articleSelectionne = nom;
    window.montantSelectionne = montant;
    document.getElementById("catalogBox").style.display = "none";
    document.getElementById("siteBox").style.display = "block";
}

function deconnexion() {
    localStorage.removeItem("phone");
    location.reload();
}

window.onload = function() {
    if(localStorage.getItem("phone")) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("welcomeBox").style.display = "block";
    }
}
