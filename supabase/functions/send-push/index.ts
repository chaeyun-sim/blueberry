import webpush from "npm:web-push@3.6.6"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const publicKey = Deno.env.get("VAPID_PUBLIC_KEY")!
const privateKey = Deno.env.get("VAPID_PRIVATE_KEY")!
const email = Deno.env.get("VAPID_EMAIL")!

webpush.setVapidDetails(email, publicKey, privateKey)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders })
  }

  let subscription: unknown, title: unknown, body: unknown
  try {
    ({ subscription, title, body } = await req.json())
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders })
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body })
    )

    return new Response("sent", { status: 200, headers: corsHeaders })
  } catch {
    return new Response("Failed to send notification", { status: 500, headers: corsHeaders })
  }
})