# Chatbot setup (one time)

1. **Database:** run `supabase/migrations/20261006090000_chat_limits.sql` in Cloud > SQL editor (after the subcategory one).
2. **Key:** create an Anthropic API key (console.anthropic.com), set a MONTHLY SPEND LIMIT there, then add it in
   Lovable Cloud > Secrets as `ANTHROPIC_API_KEY`. Never put the key in GitHub or in the code.
3. **Publish** the site again so the secret is picked up.
4. **Test:** open the site, tap "Not sure? Ask us", try "I need to hang a shelf on a concrete wall".

Limits (src/lib/chat-config.ts): 20 messages/hour per visitor, 300 messages/day for the whole shop.
If the key is missing or the limit is hit, the chat shows the Call and WhatsApp buttons instead.
To change what the bot says or knows, edit the SYSTEM text in src/lib/chat.server.ts.
