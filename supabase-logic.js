pk_sandbox_c82e4dlpeghM7RWY2XFYRhjr
sk_sandbox_FxutRTGo2cmpTKJv0EBtMTGs
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

function abrirCatalogue() { 
    ouvrirCatalogue();
}

function ouvrirCatalogue() { 
    document.getElementById("welcomeBox").style.display = "none"; 
    document.getElementById("catalogBox").style.display = "block"; 
    genererCatalogueEspaces(); 
}

function retourVersBienvenu() { document.getElementById("catalogBox").style.display = "none"; document.getElementById("welcomeBox").style.display = "block"; }
function retourAuCatalogue() { document.getElementById("siteBox").style.display = "none"; document.getElementById("catalogBox").style.display = "block"; }

async function ouvrirEspaceLocatairePrive() {
    const numeroSaisi = prompt("🔒 Espace Privé Vendeur\n\nEntrez votre numéro de téléphone :");
    if(!numeroSaisi) return;
    const codeSaisi = prompt("Entrez votre code de connexion unique (généré lors de votre paiement initial de 1000 F) :");
    if(!codeSaisi) return;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?phone=eq.${numeroSaisi.trim()}&code=eq.${codeSaisi.trim()}&status=eq.confirmé&amount=eq.1000`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        if(!data || data.length === 0) {
            alert("Numéro ou code de connexion incorrect pour cet espace ! ❌");
            return;
        }
        
        localStorage.setItem("phone", numeroSaisi.trim());
        const p = data[data.length - 1];
        
        articleSelectionne = p.name_file || `Location Espace ${p.espace_num ? (p.espace_num < 10 ? '0'+p.espace_num : p.espace_num) : '01'}`;
        numEspaceEnCoursGestion = p.espace_num || 1;
        montantSelectionne = 1000;
        currentRole = "vendeur";
        
        document.getElementById("titreAchat").innerText = `🏗️ Gestion : Espace ${numEspaceEnCoursGestion < 10 ? '0'+numEspaceEnCoursGestion : numEspaceEnCoursGestion}`;
        document.getElementById("catalogBox").style.display = "none";
        document.getElementById("siteBox").style.display = "block";

        await restaurerCode();
    } catch(e) {
        alert("Erreur lors de la vérification de vos accès ❌");
    }
}

async function selectionnerAchat(nom, montant, espaceNum = null) {
    const phone = localStorage.getItem("phone");
    
    if (montant === 1000 || nom.startsWith("Location Espace")) {
        if (phone) {
            try {
                const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/payments?phone=eq.${phone}&status=eq.confirmé&amount=eq.1000`, {
                    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
                });
                const checkData = await checkRes.json();
                if (checkData && checkData.length > 0) {
                    alert("impossible pour un seul numero de louer 2 espaces ❌");
                    return; 
                }
            } catch (errCheck) {
                console.error("Erreur de vérification de double location", errCheck);
            }
        }
    }

    articleSelectionne = nom;
    montantSelectionne = montant;
    numEspaceEnCoursGestion = espaceNum;
    
    document.getElementById("code").value = "";
    document.getElementById("topcode").style.display = "none";
    document.getElementById("topcode").innerText = "";
    document.getElementById("formationAccessZone").style.display = "none";
    
    const formattedNum = espaceNum ? (espaceNum < 10 ? '0' + espaceNum : espaceNum) : '01';

    if (montant === 1000 || nom.startsWith("Location Espace")) {
        currentRole = "vendeur";
        document.getElementById("titreAchat").innerText = `📘 Réservation : Espace ${formattedNum}`;
        document.getElementById("syntaxeOrange").innerText = `*144*10*44295613*1000#`;
        
        document.getElementById("uploadZone").style.display = "none";
        document.getElementById("vendeurCounterBox").style.display = "none";
        document.getElementById("zonePaiementStandard").style.display = "block";
        document.getElementById("zoneVerificationCode").style.display = "none";
    } else {
        currentRole = "sous_client";
        document.getElementById("titreAchat").innerText = `📘 Achat Fichier - Espace ${formattedNum}`;
        document.getElementById("syntaxeOrange").innerText = `*144*10*44295613*${montant}#`;
        
        document.getElementById("vendeurCounterBox").style.display = "none";
        document.getElementById("uploadZone").style.display = "none";
        document.getElementById("zonePaiementStandard").style.display = "block";
        document.getElementById("zoneVerificationCode").style.display = "block";
        
        restaurerCode();
    }
    
    document.getElementById("catalogBox").style.display = "none";
    document.getElementById("siteBox").style.display = "block";
}

function deconnexion(){
    clearInterval(checkInterval);
    clearInterval(countdown);
    localStorage.removeItem("phone");
    document.getElementById("loginPhone").value = "";
    document.getElementById("code").value = "";
    document.getElementById("loginBox").style.display="block";
    document.getElementById("welcomeBox").style.display="none";
    document.getElementById("catalogBox").style.display="none";
    document.getElementById("siteBox").style.display="none";
    document.getElementById("topcode").style.display="none";
    document.getElementById("timer").style.display="none";
    document.getElementById("uploadZone").style.display = "none";
    document.getElementById("formationAccessZone").style.display = "none";
    document.getElementById("vendeurCounterBox").style.display = "none";
    document.getElementById("retraitInterfaceBox").style.display = "none";
    document.getElementById("zonePaiementStandard").style.display = "block";
    document.getElementById("zoneVerificationCode").style.display = "block";
    timerStarted = false;
    currentPaymentId = null;
    vendeurCodeSecretMasque = "";
    soldeVendeurActuel = 0;
    numEspaceEnCoursGestion = null;
    urlFichierAchete = "formation2026.pdf";
}

async function genererCatalogueEspaces() {
    const spacesContainer = document.getElementById("spacesContainer");
    spacesContainer.innerHTML = ""; 

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?status=eq.confirmé&select=*`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        
        let espacesOccupes = [];
        data.forEach(item => {
            if(item.espace_num && (item.amount === 1000 || item.role === "vendeur")) {
                espacesOccupes.push(parseInt(item.espace_num));
            }
        });

        let compteLibre = 50 - espacesOccupes.length;
        document.getElementById("compteurEspaces").innerText = `(${compteLibre} Libres)`;

        for (let i = 1; i <= 50; i++) {
            if(espacesOccupes.includes(i)) {
                const formattedNum = i < 10 ? '0' + i : i;
                const donneeX = data.find(item => parseInt(item.espace_num) === i && (item.amount === 1000 || item.role === "vendeur"));
                
                const fichierLie = donneeX && donneeX.name_file ? donneeX.name_file : ('Formation ' + formattedNum);
                const prixVente = donneeX && donneeX.prix_vente ? donneeX.prix_vente : 500;

                const row = document.createElement("div");
                row.className = "espace-ligne";
                row.innerHTML = `
                    <div class="esp-num">${formattedNum}</div>
                    <div class="esp-desc"><b>${donneeX ? donneeX.description : 'Contenu partagé'}</b></div>
                    <button style="background:green; color:white;" onclick="selectionnerAchat('${fichierLie.replace(/'/g, "\\'")}', ${prixVente}, ${i})">
                        Suivre (${prixVente} F)
                    </button>
                `;
                spacesContainer.appendChild(row);
            }
        }

        const titreDiv = document.createElement("div");
        titreDiv.className = "titre-louer-bleu";
        titreDiv.innerText = "Espaces à louer";
        spacesContainer.appendChild(titreDiv);

        for (let i = 1; i <= 50; i++) {
            if(!espacesOccupes.includes(i)) {
                const formattedNum = i < 10 ? '0' + i : i;
                
                const row = document.createElement("div");
                row.className = "espace-ligne";
                row.innerHTML = `
                    <div class="esp-num">${formattedNum}</div>
                    <div class="esp-desc" style="color: #2196F3; font-style: italic;">Espace Libre</div>
                    <button style="background:#2196F3; color:white;" onclick="selectionnerAchat('Location Espace ${formattedNum}', 1000, ${i})">
                        Louer (1000 F)
                    </button>
                `;
                spacesContainer.appendChild(row);
            }
        }

    } catch (e) {
        console.error("Erreur chargement catalogue", e);
    }
}

window.onload = function(){
    const phone = localStorage.getItem("phone");
    if(phone){
        document.getElementById("loginBox").style.display="none";
        document.getElementById("welcomeBox").style.display="block";
        restaurerCode();
        surveillerConfirmation();
    } else {
        document.getElementById("loginBox").style.display="block";
    }
}

async function restaurerCode(){
    const phone = localStorage.getItem("phone");
    if(!phone) return;

    if(currentRole === "vendeur") {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?phone=eq.${phone}&status=eq.confirmé&amount=eq.1000&select=*`, {
            headers:{ apikey:SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        if(!data || data.length===0) return;
        const p = data[data.length - 1];
        currentPaymentId = p.id;
        numEspaceEnCoursGestion = p.espace_num;

        const maintenant = new Date();
        const dateExp = p.expires_at ? new Date(p.expires_at) : null;
        const estExpire = dateExp ? dateExp < maintenant : false;

        vendeurCodeSecretMasque = p.code || "";
        
        try {
            const urlFichierAChasser = p.name_file;
            let totalGains = 0;
            
            if(urlFichierAChasser && urlFichierAChasser !== "") {
                const resAchats = await fetch(`${SUPABASE_URL}/rest/v1/payments?name_file=eq.${encodeURIComponent(urlFichierAChasser)}&status=eq.confirmé&select=amount`, {
                    headers:{ apikey:SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
                });
                const dataAchats = await resAchats.json();
                if(dataAchats && dataAchats.length > 0) {
                    dataAchats.forEach(achat => {
                        if(achat.amount !== 1000) { 
                            totalGains += parseInt(achat.amount || 0);
                        }
                    });
                }
            }
            
            const resRetraits = await fetch(`${SUPABASE_URL}/rest/v1/payments?phone=eq.${phone}&select=amount,status`, {
                headers:{ apikey:SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
            });
            const dataRetraits = await resRetraits.json();
            let totalRetire = 0;
            if(dataRetraits && dataRetraits.length > 0) {
                dataRetraits.forEach(r => { 
                    if (r.status && r.status.indexOf("retrait_") === 0) {
                        totalRetire += parseInt(r.amount || 0); 
                    }
                });
            }
            
            soldeVendeurActuel = totalGains - totalRetire;
            if(soldeVendeurActuel < 0) soldeVendeurActuel = 0;
            
        } catch(errGains) {
            console.error("Erreur calcul automatique des gains:", errGains);
            soldeVendeurActuel = 0;
        }

        document.getElementById("soldeCompteur").innerText = soldeVendeurActuel;
        document.getElementById("vendeurCounterBox").style.display = "block";
        document.getElementById("zonePaiementStandard").style.display = "none";
        document.getElementById("zoneVerificationCode").style.display = "none";

        if(estExpire) {
            document.getElementById("topcode").style.display="block";
            document.getElementById("topcode").innerHTML = "🟥 Espace Expiré (30 jours)";
            document.getElementById("uploadZone").style.display = "block";
            document.getElementById("btnValiderEspace").innerText = "⚠ Réactiver mon Espace (1000 Fr)";
            document.getElementById("btnValiderEspace").onclick = reabonnerVendeur;
        } else {
            document.getElementById("topcode").style.display="block";
            document.getElementById("topcode").innerHTML = "🔒 Mon Espace Loué (Actif)";
            document.getElementById("code").value = "";
            document.getElementById("uploadZone").style.display = "block";
            
            if(p.description) { document.getElementById("descFichier").value = p.description; }
            if(p.num_depot) { document.getElementById("numDepot").value = p.num_depot; }
            if(p.prix_vente) { document.getElementById("prixEspace").value = p.prix_vente; }
        }
    } else {
        if (!articleSelectionne || articleSelectionne.startsWith("Location Espace")) return;

        const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?phone=eq.${phone}&name_file=eq.${encodeURIComponent(articleSelectionne)}&status=eq.confirmé&select=*`, {
            headers:{ apikey:SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        
        if(!data || data.length === 0) {
            document.getElementById("topcode").style.display = "none";
            document.getElementById("code").value = "";
            document.getElementById("formationAccessZone").style.display = "none";
            return;
        }
        
        const p = data[data.length - 1];
        currentPaymentId = p.id;

        const maintenant = new Date();
        const dateExp = p.expires_at ? new Date(p.expires_at) : null;
        const estExpire = dateExp ? dateExp < maintenant : false;

        document.getElementById("vendeurCounterBox").style.display = "none";
        document.getElementById("zonePaiementStandard").style.display = "block";
        document.getElementById("zoneVerificationCode").style.display = "block";
        
        if(!estExpire) {
            document.getElementById("topcode").style.display="block";
            document.getElementById("topcode").innerHTML = "🔑 Code actif : " + p.code;
            document.getElementById("code").value = p.code;
            expirationDateGlobale = p.expires_at;

            urlFichierAchete = p.name_file ? p.name_file : "formation2026.pdf";
            
            const urlMinuscule = urlFichierAchete.toLowerCase();
            if (urlMinuscule.includes('.mp4') || urlMinuscule.includes('.mov') || urlMinuscule.includes('.avi') || urlMinuscule.includes('.mkv')) {
                document.getElementById("btnVoirFichier").innerText = "👁️ Voir la Vidéo";
                document.getElementById("btnTelechargerFichier").innerText = "⬇️ Télécharger la Vidéo";
            } else {
                document.getElementById("btnVoirFichier").innerText = "👁️ Voir le PDF";
                document.getElementById("btnTelechargerFichier").innerText = "⬇️ Télécharger le PDF";
            }

            document.getElementById("formationAccessZone").style.display = "block";
            if(!timerStarted){ startTimer(p.expires_at); timerStarted = true; }
        }
    }
}

async function payer(){
    const phone = localStorage.getItem("phone");
    if(!phone) return;
    
    // Initialisation du pop-up sécurisé FedaPay
    FedaPay.init('#payBtn', {
        public_key: 'pk_sandbox_c82e4dlpeghM7RWY2XFYRhjr',
        transaction: {
            amount: montantSelectionne,
            description: 'Achat KOALA Drive - ' + articleSelectionne
        },
        customer: {
            phone_number: {
                number: phone,
                country: 'BF'
            }
        },
        onComplete: async function(reason) {
            if (reason === FedaPay.DIALOG_DISMISSED) {
                alert("Paiement annulé ou fenêtre fermée ❌");
            } else {
                // Paiement approuvé : génération automatique du code unique
                const codeGenere = Math.floor(100000 + Math.random() * 900000).toString();
                
                // Calcul de la date d'expiration (+30 jours)
                const dateExpiration = new Date();
                dateExpiration.setDate(dateExpiration.getDate() + 30);
                
                const res = await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
                    method:"POST",
                    headers:{ apikey:SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type":"application/json" },
                    body:JSON.stringify({ 
                        phone: phone, 
                        status: "confirmé", 
                        amount: montantSelectionne, 
                        role: currentRole, 
                        name_file: articleSelectionne,
                        code: codeGenere,
                        expires_at: dateExpiration.toISOString(),
                        espace_num: numEspaceEnCoursGestion ? parseInt(numEspaceEnCoursGestion) : null
                    })
                });

                if(res.ok) { 
                    alert("🎉 Paiement validé avec succès ! Votre code d'accès est : " + codeGenere); 
                    await restaurerCode();
                } else {
                    alert("Erreur lors de la sauvegarde sur votre base de données. En attente de traitement. ⚠️");
                }
            }
        }
    });
}

function surveillerConfirmation(){
    clearInterval(checkInterval);
    checkInterval = setInterval(async ()=>{
        const phone = localStorage.getItem("phone");
        if(!phone) return;

        let urlFiltre = (currentRole === "vendeur") ? `&amount=eq.1000` : `&name_file=eq.${encodeURIComponent(articleSelectionne)}`;

        const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?phone=eq.${phone}${urlFiltre}&select=*`, {
            headers:{ apikey:SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        if(!data || data.length===0) return;
        const p = data[data.length - 1];
        currentPaymentId = p.id;

        if(p.status === "confirmé") { restaurerCode(); }
    },10000);
}

async function verifier(){
    const code = document.getElementById("code").value.trim();
    const phone = localStorage.getItem("phone");
    const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?phone=eq.${phone}&code=eq.${code}&status=eq.confirmé&name_file=eq.${encodeURIComponent(articleSelectionne)}`, {
        headers:{ apikey:SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    const data = await res.json();
    if(data.length > 0) { alert("Accès Validé ✔"); restaurerCode(); } else { alert("Code incorrect ou non lié à ce fichier ❌"); }
}

async function validerConfigurationEspace() {
    const description = document.getElementById("descFichier").value.trim();
    const numero = document.getElementById("numDepot").value.trim();
    const prix = document.getElementById("prixEspace").value.trim();
    const fileInput = document.getElementById("fileInput");

    if (!description || !numero || !prix || fileInput.files.length === 0) {
        alert("Veuillez remplir tous les champs obligatoires ! ❌");
        return;
    }
    const fichier = fileInput.files[0];
    if (fichier.size > 10 * 1024 * 1024) { alert("Fichier trop lourd (Max 10 Mo) ❌"); return; }

    if(!currentPaymentId) { alert("Aucune location active trouvée pour publier ❌"); return; }

    const btnValidation = document.getElementById("btnValiderEspace");
    btnValidation.disabled = true;
    btnValidation.innerText = "Téléversement du fichier en cours... ⏳";

    const extension = fichier.name.split('.').pop();
    const nomFichierUnique = "koala_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7) + "." + extension;

    try {
        const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/fichiers-locataires/${nomFichierUnique}`, {
            method: "POST",
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                "Content-Type": fichier.type
            },
            body: fichier
        });

        if(!uploadRes.ok) {
            throw new Error("Échec du téléversement vers le stockage Supabase.");
        }

        const urlPubliqueFichier = `${SUPABASE_URL}/storage/v1/object/public/fichiers-locataires/${nomFichierUnique}`;

        const res = await fetch(`${SUPABASE_URL}/rest/v1/payments?id=eq.${currentPaymentId}`, {
            method: "PATCH",
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                description: description,
                num_depot: numero,
                prix_vente: parseInt(prix),
                espace_num: parseInt(numEspaceEnCoursGestion),
                name_file: urlPubliqueFichier
            })
        });

        if(res.ok) {
            alert("🚀 Félicitations ! Votre fichier a été hébergé et votre espace est publié avec succès !");
            retourAuCatalogue();
        } else {
            alert("Erreur lors de l'enregistrement des informations de l'espace ❌");
        }

    } catch(erreur) {
        console.error(erreur);
        alert("Erreur réseau ou problème de droits avec le Bucket Supabase. Vérifie tes RLS Policies. ❌");
    } finally {
        btnValidation.disabled = false;
        btnValidation.innerText = "🚀 Valider et publié mon espace";
    }
}

async function reabonnerVendeur() { payer(); }

function ouvrirPDF() { window.open(urlFichierAchete, "_blank"); }
function telechargerPDF() { const a = document.createElement("a"); a.href = urlFichierAchete; a.download = "fichier_koala"; a.click(); }

function startTimer(expireDate){
    clearInterval(countdown);
    const exp = new Date(expireDate);
    document.getElementById("timer").style.display="block";
    const updateTimerText = () => {
        const diff = exp - new Date();
        if(diff <= 0){ document.getElementById("timer").innerHTML = "❌ Expiré"; return; }
        document.getElementById("timer").innerHTML = "⏳ Expire dans " + Math.floor(diff/3600000) + "h " + Math.floor((diff%3600000)/60000) + "m";
    };
    updateTimerText();
    countdown = setInterval(updateTimerText, 60000);
}

function afficherBoutonRetrait() {
    const btn = document.getElementById("btnDeclencherRetrait");
    btn.style.display = btn.style.display === "none" ? "inline-block" : "none";
}

function ouvrirInterfaceRetrait(event) {
    event.stopPropagation(); 
    document.getElementById("retraitInterfaceBox").style.display = "block";
}

function fermerInterfaceRetrait() {
    document.getElementById("retraitInterfaceBox").style.display = "none";
}

async function validerDemandeRetrait() {
    const phoneRetrait = document.getElementById("retraitOrangePhone").value.trim();
    const montantRetrait = document.getElementById("retraitMontant").value.trim();
    const phoneVendeur = localStorage.getItem("phone");

    if(!phoneRetrait || !montantRetrait) {
        alert("Veuillez remplir tous les champs ! ❌");
        return;
    }

    const montant = parseInt(montantRetrait);
    if(montant > soldeVendeurActuel) {
        alert(`Solde insuffisant ! Votre solde actuel est de ${soldeVendeurActuel} F CFA. ❌`);
        return;
    }

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
            method: "POST",
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: phoneVendeur,
                status: "retrait_en_attente",
                amount: montant,
                role: "vendeur",
                description: `Demande retrait vers le numéro Orange Money : ${phoneRetrait}`
            })
        });

        if(res.ok) {
            soldeVendeurActuel -= montant;
            document.getElementById("soldeCompteur").innerText = soldeVendeurActuel;
            
            alert("Votre demande de retrait a été transmise avec succès ! Elle sera validée après traitement. 🚀");
            fermerInterfaceRetrait();
            await restaurerCode();
        } else {
            alert("Une erreur est survenue lors de la soumission de votre retrait. ❌");
        }
    } catch(e) {
        alert("Erreur de connexion réseau ❌");
    }
}
