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
    if (!FEDAPAY_SECRET_KEY) {
      throw new Error("Clé secrète FedaPay manquante sur le serveur Supabase.");
    }

    const { action, amount, phone, description, item_name } = await req.json()

    if (action === "creer_paiement") {
      const response = await fetch("https://api.fedapay.com/v1/transactions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FEDAPAY_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amount,
          currency: { iso: "XOF" },
          description: description || `Achat KOALA Drive - ${item_name}`,
          customer: {
            phone_number: { number: phone, country: "BF" }
          }
        })
      })

      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      })
    }

    if (action === "executer_retrait") {
      return new Response(JSON.stringify({ message: "Prêt pour le retrait automatique" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      })
    }

    return new Response(JSON.stringify({ error: "Action non reconnue" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    })
  }
})
