import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apiKey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const FEDAPAY_SECRET_KEY = Deno.env.get("FEDAPAY_SECRET_KEY");
    if (!FEDAPAY_SECRET_KEY) throw new Error("Clé secrète manquante.");

    const { action, amount, phone, country, description } = await req.json();

    // 1. ACTION POUR CRÉER UN PAIEMENT (LOCATAIRE)
    if (action === "creer_paiement") {
      const response = await fetch("https://api.fedapay.com/v1/transactions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${FEDAPAY_SECRET_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          currency: { iso: "XOF" },
          description: description || "Paiement KOALA",
          customer: { phone_number: { number: phone, country: country || "BF" } }
        })
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // 2. ACTION POUR EXÉCUTER LE RETRAIT (VENDEUR)
    if (action === "executer_retrait") {
      const response = await fetch("https://api.fedapay.com/v1/payouts", {
        method: "POST",
        headers: { "Authorization": `Bearer ${FEDAPAY_SECRET_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          currency: { iso: "XOF" },
          customer: { phone_number: { number: phone, country: country || "BF" } },
          description: "Retrait gains KOALA"
        })
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.ok ? 200 : 400 });
    }

    return new Response(JSON.stringify({ error: "Action inconnue" }), { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})
