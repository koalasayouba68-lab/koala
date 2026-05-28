const FEDAPAY_PUBLIC_KEY = "pk_sandbox_c82e4dlpeghM7RWY2XFYRhjr";
const FEDAPAY_SECRET_KEY = "sk_sandbox_FxutRTGo2cmpTKJv0EBtMTGs";
const SUPABASE_URL = "https://gkqlmpkmzfvurkzgrjlm.supabase.co";
const SUPABASE_KEY = "sb_publishable_TpKfbr8y19-DzT9dQvlr5Q_2MR-ciXr";

let countdown, checkInterval, essais = 0, timerStarted = false, derniereVerification = "";
let appareilID = obtenirAppareilID();
let articleSelectionne = "", montantSelectionne = 300, expirationDateGlobale = null, currentRole = "sous_client"; 
let currentPaymentId = null;

let vendeurCodeSecretMasque = "";
let soldeVendeurActuel = 0;
let numEspaceEnCoursGestion = null;
let urlFichierAchete = "formation2026.pdf";

function genererIdentifiantSecours() { return 'dev-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36); }
function obtenirAppareilID() {
    let id = localStorage.getItem("appareilID");
    if (!id) { id = genererIdentifiantSecours(); localStorage.setItem("appareilID", id); }
    return id;
}

function connexion(){
    const phone = document.getElementById("loginPhone").value.trim();
    if(!phone || phone.length < 8){ alert("Numéro invalide ❌"); return; }
    localStorage.setItem("phone", phone);
    document.getElementById("loginBox").style.display="none";
    document.getElementById("welcomeBox").style.display="block";
    restaurerCode();
    surveillerConfirmation();
}

function ouvrirCatalogue() { 
    document.getElementById("welcomeBox").style.display = "none"; 
    document.getElementById("catalogBox").style.display = "block"; 
    genererCatalogueEspaces(); 
}

function retourVersBienvenu() { document.getElementById("catalogBox").style.display = "none"; document.getElementById("welcomeBox").style.display = "block"; }
function retourAuCatalogue() { document.getElementById("siteBox").style.display = "none"; document.getElementById("catalogBox").style.display = "block"; }

async function ouvrirEspaceLocatairePrive() {
    const numeroSaisi = prompt("🔒 Espace Privé Vendeur\n\nEntrez votre numéro :");
    if(!numeroSaisi) return;
    const codeSaisi = prompt("Entrez votre code de connexion :");
    if(!codeSaisi) return;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?phone=eq.${numeroSaisi.trim()}&code=eq.${codeSaisi.trim()}&status=eq.confirmé&amount=eq.1000`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        if(!data || data.length === 0) { alert("Accès incorrect ❌"); return; }
        
        localStorage.setItem("phone", numeroSaisi.trim());
        const p = data[data.length - 1];
        articleSelectionne = p.name_file;
        numEspaceEnCoursGestion = p.espace_num;
        currentRole = "vendeur";
        document.getElementById("titreAchat").innerText = `🏗️ Gestion : Espace ${numEspaceEnCoursGestion}`;
        document.getElementById("catalogBox").style.display = "none";
        document.getElementById("siteBox").style.display = "block";
        await restaurerCode();
    } catch(e) { alert("Erreur accès ❌"); }
}

async function selectionnerAchat(nom, montant, espaceNum = null) {
    articleSelectionne = nom;
    montantSelectionne = montant;
    numEspaceEnCoursGestion = espaceNum;
    
    currentRole = (montant === 1000 || nom.startsWith("Location")) ? "vendeur" : "sous_client";
    document.getElementById("titreAchat").innerText = `📘 Accès : ${nom}`;
    
    document.getElementById("catalogBox").style.display = "none";
    document.getElementById("siteBox").style.display = "block";
    document.getElementById("uploadZone").style.display = "none";
    document.getElementById("vendeurCounterBox").style.display = "none";
    document.getElementById("zoneVerificationCode").style.display = (currentRole === "vendeur") ? "none" : "block";
    
    restaurerCode();
}

// Fonction vide pour éviter les conflits, c'est fedapay-integration.js qui gère
window.payer = function() { console.log("Utilisation de FedaPay intégration"); };

function deconnexion(){
    localStorage.removeItem("phone");
    location.reload();
}
// ... (Garde le reste de tes fonctions de gestion comme genererCatalogueEspaces, restaurerCode, etc.)
