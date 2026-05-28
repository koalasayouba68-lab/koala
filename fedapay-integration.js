// Ce code remplace tes fonctions de paiement et retrait actuelles
window.payer = function() {
    // Redirection vers le paiement FedaPay (Cartes + Tous Mobile Money)
    // On utilise les variables qui sont déjà dans ton autre fichier
    const montant = typeof montantSelectionne !== 'undefined' ? montantSelectionne : 300;
    const item = typeof articleSelectionne !== 'undefined' ? articleSelectionne : "Achat";
    const phone = localStorage.getItem("phone");

    const url = `https://gkqlmpkmzfvurkzgrjlm.supabase.co/functions/v1/hyper-task`;
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'creer_paiement', amount: montant, phone: phone, item_name: item })
    })
    .then(res => res.json())
    .then(data => {
        if (data.transaction && data.transaction.callback_url) {
            window.location.href = data.transaction.callback_url;
        } else {
            alert("Erreur : impossible de joindre FedaPay.");
        }
    });
};

window.validerDemandeRetrait = function() {
    const phoneRetrait = document.getElementById('retraitOrangePhone').value;
    const montant = document.getElementById('retraitMontant').value;
    
    fetch('https://gkqlmpkmzfvurkzgrjlm.supabase.co/functions/v1/hyper-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'executer_retrait', amount: parseInt(montant), phone: phoneRetrait })
    })
    .then(res => res.json())
    .then(data => alert("Demande traitée : " + (data.message || "Succès")));
};
