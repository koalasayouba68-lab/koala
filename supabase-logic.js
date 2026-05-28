<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KOALA - Plateforme Officielle</title>
    <style>
        body{font-family:Arial, sans-serif;background:#f4f4f4;padding:10px;margin:0;}
        .box{width:95%;max-width:700px;margin:20px auto;background:white;padding:20px;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.2);}
        .spaces-list-vertical {display: flex;flex-direction: column;max-height: 480px;overflow-y: auto;padding: 5px;}
        .espace-ligne {display: flex;align-items: center;justify-content: space-between;background: #fdfdfd;border: 1px solid #ddd;padding: 10px;border-radius: 8px;font-size: 14px;margin-bottom: 6px;}
        button{padding:10px;width:100%;margin-top:10px;cursor:pointer;border:none;border-radius:8px;font-size:16px;}
        input{width:100%;padding:10px;margin-top:10px;box-sizing:border-box;border-radius:8px;border:1px solid #ccc;}
        #uploadZone { background: #e3f2fd; border: 2px dashed #2196F3; padding: 15px; border-radius: 8px; margin-top: 15px; display: none; }
        .vendeur-counter-box { background: #9c27b0; color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; text-align: center; font-weight: bold; }
    </style>
</head>
<body>

<div id="loginBox" class="box">
    <h2>🔐 Connexion</h2>
    <input id="loginPhone" type="tel" placeholder="Entrer votre numéro">
    <button onclick="connexion()" style="background:#2196F3; color:white;">Continuer</button>
</div>

<div id="welcomeBox" class="box" style="display:none;">
    <h1 style="color: red; text-align: center; font-size: 24px; font-weight: bold;">Bienvenue sur le site KOALA</h1>
    <p style="line-height: 1.6; text-align: justify;">
        Bienvenue dans l'univers KOALA, votre plateforme tout-en-un de partage et d'apprentissage en ligne !<br><br>
        Ici, nous vous proposons deux opportunités uniques :<br><br>
        <b>• Des Espaces de Vente à Louer :</b> Vous êtes créateur ? Louez votre propre espace sécurisé pour seulement 1000 Fr CFA par mois ! Vous pourrez y importer et vendre votre propre fichier PDF ou votre vidéo (taille maximale de 10 Mo) en toute simplicité. Vos clients pourront y accéder et les télécharger en un clic.<br><br>
        <b>• Des Formations en Ligne Accessibles :</b> Découvrez notre catalogue de formation de haute qualité à un coût extrêmement réduit et adapté à vos besoins. Apprenez à votre rythme, payez uniquement ce dont vous avez besoin, et débloquez votre contenu instantanément après validation.<br><br>
        <i>Cliquez sur le bouton ci-dessous pour découvrir nos formations disponibles et louer votre espace de vente dès maintenant !</i>
    </p>
    <button onclick="ouvrirCatalogue()" style="background: red; color: white; font-weight: bold; font-size: 18px; margin-top: 15px;">Découvrir le catalogue ➔</button>
</div>

<div id="catalogBox" class="box" style="display:none;">
    <h3 id="compteurEspaces" style="color: #2196F3;">Chargement...</h3>
    <button onclick="ouvrirEspaceLocatairePrive()" style="background:#9c27b0; color:white;">🛠 Accès Espace Locataire</button>
    <div class="spaces-list-vertical" id="spacesContainer"></div>
</div>

<div class="box" id="siteBox" style="display:none;">
    <h2 id="titreAchat">📘 Accès Service</h2>
    <div id="vendeurCounterBox" class="vendeur-counter-box" style="display: none;">💰 Solde : <span id="soldeCompteur">0</span> F CFA</div>
    
    <div id="zonePaiementStandard">
        <button id="payBtn" onclick="payer()" style="background:green; color:white; font-weight:bold;">✔ Payer avec FedaPay</button>
    </div>

    <div id="zoneVerificationCode">
        <h3>🔑 Entrer le code reçu</h3>
        <input id="code" placeholder="Entrez le code">
        <button onclick="verifier()" style="background:#9c27b0; color:white;">Vérifier</button>
    </div>

    <div id="uploadZone">
        <h3>🏗️ Configuration Espace</h3>
        <input type="text" id="descFichier" placeholder="Description...">
        <input type="tel" id="numDepot" placeholder="Numéro...">
        <input type="number" id="prixEspace" placeholder="Prix...">
        <input type="file" id="fileInput">
        <button id="btnValiderEspace" onclick="validerConfigurationEspace()" style="background:#1565c0; color:white;">🚀 Publier</button>
    </div>

    <button onclick="retourAuCatalogue()" style="background:#666; color:white;">🏠 Retour</button>
    <button onclick="deconnexion()" style="background:red; color:white;">Déconnexion</button>
</div>

<script src="https://cdn.fedapay.com/online/v1/fedapay.js"></script>
<script src="supabase-logic.js"></script>
<script src="fedapay-integration.js"></script>
</body>
</html>
