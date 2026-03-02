export default {
  async fetch(request, env) {

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const data = await request.json();

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Kunal Kumar <contact@kunalworld.in>",
        to: "contact@kunalworld.in",
        subject: `New message from ${data.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><b>Name:</b> ${data.name}</p>
          <p><b>Email:</b> ${data.email}</p>
          <p><b>Message:</b><br>${data.message}</p>
        `
      })
    });

    return new Response("Email Sent");
  }
};
